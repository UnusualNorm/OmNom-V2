import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command, RegisterBehavior } from '@sapphire/framework';
import {
  AutocompleteInteraction,
  EmbedFieldData,
  GuildMember,
  Message,
  MessageEmbed,
  Role,
  TextChannel,
  ThreadChannel,
} from 'discord.js';
import filterMapP from '../filters/index.js';
import {
  getActiveFilters,
  messageToWebhookOptions,
  sendGetCreateWebhook,
} from '../utils';

@ApplyOptions<Command.Options>({
  name: 'filter',
  description: 'Add some pzazz to your server!',
})
export class FilterCommand extends Command {
  async autocompleteRun(interaction: AutocompleteInteraction) {
    // This function should only be ran if we're looking to autocomplete a filter name
    const filterMap = await filterMapP;
    const filterNames = Array.from(filterMap, ([, value]) => value);

    const focusedValue = interaction.options.getFocused().toString();
    const autoComplete = filterNames.filter((filter) =>
      filter.name.startsWith(focusedValue)
    );

    const autoCompleteMap = autoComplete.map((choice) => ({
      name: choice.name,
      value: choice.id,
    }));
    autoCompleteMap.push({
      name: 'exclude',
      value: 'exclude',
    });

    interaction.respond(autoCompleteMap);
  }

  async messageRun(message: Message, args: Args) {
    const filterMap = await filterMapP;

    if (
      !(message.channel instanceof TextChannel) &&
      !(message.channel instanceof ThreadChannel)
    )
      return message.reply(
        'This command can only be used in a guild text channel!'
      );

    if (message.type != 'REPLY')
      return message.reply(
        'This command can only be used when replying to a message!'
      );
    if (!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES'))
      return message.reply('You do not have permission to use this command!');

    if (
      !message.channel
        .permissionsFor(message.guild.me)
        .has('MANAGE_MESSAGES') ||
      !message.channel.permissionsFor(message.guild.me).has('MANAGE_WEBHOOKS')
    )
      return message.reply('I do not have permission to perform this action!');

    const argsArray: string[] = [];
    let arg = args.next();
    while (arg) {
      argsArray.push(arg);
      arg = args.next();
    }

    const validFilters = argsArray.filter((filter) => filterMap.has(filter));
    const filters = validFilters.map((filter) => filterMap.get(filter));

    if (filters.length == 0)
      return message.reply(
        // Add an s to the end when needed
        `Invalid filter${argsArray.length != 1 ? 's' : ''}!`
      );

    const referenceMessage = await message.fetchReference();
    let webhookOptions = messageToWebhookOptions(referenceMessage);

    for (const { filter } of filters)
      webhookOptions = await filter(webhookOptions);

    await sendGetCreateWebhook(message.channel, webhookOptions);
    await referenceMessage.delete();
  }

  async add(interaction: Command.ChatInputInteraction) {
    const filterMap = await filterMapP;
    await this.container.client.db.query(
      `CREATE TABLE IF NOT EXISTS guild_${interaction.guildId}_filters (filter VARCHAR(255), id VARCHAR(255), idType VARCHAR(255))`
    );

    if (!(interaction.member instanceof GuildMember)) return interaction.editReply('Failed to fetch your profile... (Try again?)');
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.editReply('You do not have permission to use this command!');

    const filterName = interaction.options.getString('filter');
    if (!filterMap.has(filterName) && filterName != 'exclude')
      return interaction.editReply(`Invalid filter: ${filterName}...`);

    const mentionable = interaction.options.getMentionable('target');
    if (!(mentionable instanceof GuildMember) && !(mentionable instanceof Role))
      return interaction.editReply('Invalid target...');

    let mentionableType: string;
    if (mentionable instanceof GuildMember) mentionableType = 'member';
    else if (mentionable instanceof Role) mentionableType = 'role';

    await this.container.client.db.insert(
      `guild_${interaction.guildId}_filters`,
      {
        filter: filterName,
        id: mentionable.id,
        idType: mentionableType,
      }
    );

    let mentionableName: string;
    if (mentionable instanceof GuildMember)
      mentionableName = mentionable.displayName;
    else if (mentionable instanceof Role) mentionableName = mentionable.name;

    return interaction.editReply(
      `Added filter: "${filterName}" to: "${mentionableName}"!`
    );
  }

  async remove(interaction: Command.ChatInputInteraction) {
    const filterMap = await filterMapP;
    await this.container.client.db.query(
      `CREATE TABLE IF NOT EXISTS guild_${interaction.guildId}_filters (filter VARCHAR(255), id VARCHAR(255), idType VARCHAR(255))`
    );

    if (!(interaction.member instanceof GuildMember)) return interaction.editReply('Failed to fetch your profile... (Try again?)');
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.editReply('You do not have permission to use this command!');

    const filterName = interaction.options.getString('filter');
    if (!filterMap.has(filterName) && filterName != 'exclude')
      return interaction.editReply(`Invalid filter: ${filterName}...`);

    const mentionable = interaction.options.getMentionable('target');
    if (!(mentionable instanceof GuildMember) && !(mentionable instanceof Role))
      return interaction.editReply('Invalid target...');

    let mentionableType: string;
    if (mentionable instanceof GuildMember) mentionableType = 'member';
    else if (mentionable instanceof Role) mentionableType = 'role';

    await this.container.client.db.delete(
      `guild_${interaction.guildId}_filters`,
      {
        filter: filterName,
        id: mentionable.id,
        idType: mentionableType,
      }
    );

    let mentionableName: string;
    if (mentionable instanceof GuildMember)
      mentionableName = mentionable.displayName;
    else if (mentionable instanceof Role) mentionableName = mentionable.name;

    return interaction.editReply(
      `Removed filter: "${filterName}" from: "${mentionableName}"!`
    );
  }

  async active(interaction: Command.ChatInputInteraction) {
    await this.container.client.db.query(
      `CREATE TABLE IF NOT EXISTS guild_${interaction.guildId}_filters (filter VARCHAR(255), id VARCHAR(255), idType VARCHAR(255))`
    );

    const target =
      interaction.options.getMember('target') || interaction.member;
    if (!(target instanceof GuildMember))
      return interaction.editReply(
        'Failed to load the target... (Try again?)'
      );

    const roleIds = target.roles.cache.map((role) => role.id);
    const activeFilters = await getActiveFilters(
      this.container.client.db,
      target.id,
      interaction.channelId,
      roleIds,
      interaction.guildId
    );

    if (activeFilters.length == 0)
      return interaction.editReply('No active filters... (Try adding some!)');

    const embed = new MessageEmbed();
    embed.setTitle('Filters | Active');

    const filterFields = new Array<EmbedFieldData>();
    for (const filter of activeFilters)
      filterFields.push({
        name: filter.name,
        value: filter.description,
      });

    embed.setFields(filterFields);

    return interaction.editReply({
      embeds: [embed],
    });
  }

  async preview(interaction: Command.ChatInputInteraction) {
    const filterMap = await filterMapP;
    const filterName = interaction.options.getString('filter');

    if (!filterMap.has(filterName))
      return interaction.editReply(`Invalid filter: ${filterName}...`);

    const filter = filterMap.get(filterName);
    const text = interaction.options.getString('text');

    const preview = await filter.preview(text);
    return interaction.editReply(preview);
  }

  async list(interaction: Command.ChatInputInteraction) {
    const filterMap = await filterMapP;

    const embed = new MessageEmbed();
    embed.setTitle('Filters | List');

    const filterFields: EmbedFieldData[] = Array.from(
      filterMap,
      ([, value]) => ({ name: value.name, value: value.description })
    );
    embed.setFields(filterFields);

    await interaction.editReply({
      embeds: [embed],
    });
  }

  async clear(interaction: Command.ChatInputInteraction) {
    await this.container.client.db.query(
      `CREATE TABLE IF NOT EXISTS guild_${interaction.guildId}_filters (filter VARCHAR(255), id VARCHAR(255), idType VARCHAR(255))`
    );

    if (!(interaction.member instanceof GuildMember)) return interaction.editReply('Failed to fetch your profile... (Try again?)');
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.editReply('You do not have permission to use this command!');

    const mentionable = interaction.options.getMentionable('target');
    if (!(mentionable instanceof GuildMember) && !(mentionable instanceof Role))
      return interaction.editReply('Invalid target...');

    let mentionableType: string;
    if (mentionable instanceof GuildMember) mentionableType = 'member';
    else if (mentionable instanceof Role) mentionableType = 'role';

    await this.container.client.db.delete(
      `guild_${interaction.guildId}_filters`,
      {
        id: mentionable.id,
        idType: mentionableType,
      }
    );

    let mentionableName: string;
    if (mentionable instanceof GuildMember)
      mentionableName = mentionable.displayName;
    else if (mentionable instanceof Role) mentionableName = mentionable.name;

    return interaction.editReply(
      `Cleared all filters from: "${mentionableName}"!`
    );
  }

  async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.deferReply({
      ephemeral: true,
    });

    try {
      const subcommand = interaction.options.getSubcommand();
      switch (subcommand) {
        case 'add':
          return this.add(interaction);
        case 'remove':
          return this.remove(interaction);
        case 'clear':
          return this.clear(interaction);
        case 'active':
          return this.active(interaction);
        case 'preview':
          return this.preview(interaction);
        case 'list':
          return this.list(interaction);
        default:
          return interaction.editReply('Invalid subcommand!');
      }
    } catch (error) {
      console.error(error);
      return interaction.editReply('Something went wrong...');
    }
  }

  registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName('filter')
          .setDescription('Add some pzazz to your server!')
          .addSubcommand((command) =>
            command
              .setName('add')
              .setDescription('Add a filter!')
              .addStringOption((option) =>
                option
                  .setRequired(true)
                  .setAutocomplete(true)
                  .setName('filter')
                  .setDescription('The filter to add to the target!')
              )
              .addMentionableOption((option) =>
                option
                  .setRequired(true)
                  .setName('target')
                  .setDescription('The target to add the filter to!')
              )
          )
          .addSubcommand((command) =>
            command
              .setName('remove')
              .setDescription('Remove a filter!')
              .addStringOption((option) =>
                option
                  .setRequired(true)
                  .setAutocomplete(true)
                  .setName('filter')
                  .setDescription('The filter to remove from the target!')
              )
              .addMentionableOption((option) =>
                option
                  .setRequired(true)
                  .setName('target')
                  .setDescription('The target to remove the filter from!')
              )
          )
          .addSubcommand((command) =>
            command
              .setName('clear')
              .setDescription('Clear all filters from a target!')
              .addMentionableOption((option) =>
                option
                  .setRequired(true)
                  .setName('target')
                  .setDescription('The target to add the filter to!')
              )
          )
          .addSubcommand((command) =>
            command
              .setName('active')
              .setDescription('List all the filters being applied to a target!')
              .addUserOption((option) =>
                option
                  .setRequired(false)
                  .setName('target')
                  .setDescription('The target to add the filter to!')
              )
          )
          .addSubcommand((command) =>
            command
              .setName('preview')
              .setDescription('Preview a filter!')
              .addStringOption((option) =>
                option
                  .setRequired(true)
                  .setAutocomplete(true)
                  .setName('filter')
                  .setDescription('The filter to preview!')
              )
              .addStringOption((option) =>
                option
                  .setRequired(true)
                  .setName('text')
                  .setDescription('The text to preview the filter with!')
              )
          )
          .addSubcommand((command) =>
            command
              .setName('list')
              .setDescription('List all the filters you can use!')
          ),
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }
}
