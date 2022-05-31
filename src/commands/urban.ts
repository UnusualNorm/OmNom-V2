import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedAuthorData, MessageEmbed, MessageEmbedFooter } from 'discord.js';
import { urbanRequest, getFakeFace } from '../utils';

ApplyOptions<CommandOptions>({
  name: 'urban',
  description: 'Lookup a definition from the Urban Dictionary!',
  chatInputCommand: {
    register: true,
  },
});

export class FilterCommand extends Command {
  async chatInputRun(interaction: Command.ChatInputInteraction) {
    try {
    // This is going to take a bit...
    // Let's make sure discord doesn't timeout us
    await interaction.deferReply();

    // Immediately request a fake face
    // This takes a while, we'll await it later
    const fakeFaceRequest = getFakeFace();

    // Parse the term, make sure it exists
    const term = interaction.options.getString('term');
    const res = await urbanRequest(term);
    const entry = res.list[0];
    if (!entry) return interaction.editReply('No definition found :(');

    // Some words are surrounded by square brackets,
    // Remove the brackets so we have the full definition
    const definition = entry.definition.replace(/\[.*\]/, (word) =>
      word.replace(/\[|\]/g, '')
    );
    // Same for the example
    const example = entry.example.replace(/\[|\]/g, (word) =>
      word.replace(/\[|\]/g, '')
    );

    // Build the embed data
    const embedAuthor: EmbedAuthorData = {
      name: entry.author,
      url: `https://www.urbandictionary.com/author.php?author=${encodeURIComponent(
        entry.author
      )}`,
    };
    const embedDefinition = `${definition}\n\n${example}`;
    const embedFooter: MessageEmbedFooter = {
      iconURL:
        'https://static.wikia.nocookie.net/logopedia/images/0/0b/UDFavicon.png/revision/latest?cb=20170422211131',
      text: `👍 ${entry.thumbs_up} | 👎 ${entry.thumbs_down}`,
    };
    embedAuthor.iconURL = (await fakeFaceRequest).src;

    // Build and sendthe embed
    const embed = new MessageEmbed();
    embed.setTitle(entry.word);
    embed.setURL(entry.permalink);
    embed.setDescription(embedDefinition);
    embed.setAuthor(embedAuthor);
    embed.setFooter(embedFooter);
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(`[ERROR] (urban) ${error.message}`);
    if (interaction.deferred) interaction.editReply('Something went wrong!');
    else interaction.reply('Something went wrong!');
  }
  }

  registerApplicationCommands(registry: Command.Registry) {
    // Register chat input command
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('urban')
        .setDescription('Look up a definition from the Urban Dictionary!')
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName('term')
            .setDescription('The term to lookup!')
        )
    );
  }
}
