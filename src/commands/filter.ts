import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command, CommandOptions } from '@sapphire/framework';
import { ApplicationCommandType } from 'discord-api-types/v10';

ApplyOptions<CommandOptions>({
  name: 'filter',
  description: 'Mange all your filter needs!',
  chatInputCommand: {
    register: true,
  },
});

export class FilterCommand extends Command {
  add(interaction: Command.ChatInputInteraction) {
    throw new Error('Method not implemented.');
  }

  remove(interaction: Command.ChatInputInteraction) {
    throw new Error('Method not implemented.');
  }

  current(interaction: Command.ChatInputInteraction) {
    throw new Error('Method not implemented.');
  }

  list(interaction: Command.ChatInputInteraction) {
    throw new Error('Method not implemented.');
  }

  clear(interaction: Command.ChatInputInteraction) {
    throw new Error('Method not implemented.');
  }

  // Handle and run subcommands
  async chatInputRun(interaction: Command.ChatInputInteraction) {
    // Check which subcommand was used
    const subcommand = interaction.options.getSubcommand(true);
    switch (subcommand) {
      case 'add':
        return this.add(interaction);
      case 'remove':
        return this.remove(interaction);
      case 'clear':
        return this.clear(interaction);
      case 'current':
        return this.current(interaction);
      case 'list':
        return this.list(interaction);
      default:
        return interaction.reply('Invalid subcommand!');
    }
  }

  registerApplicationCommands(registry: Command.Registry) {
    // Register chat input command
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('filter')
        .setDescription('Mange all your filter needs!')
        .addSubcommand((command) =>
          command.setName('add').setDescription('Add a filter!').addRoleOption(option => option.setRequired(false).setName('role').setDescription('The role to add the filter to!'))
        )
        .addSubcommand((command) =>
          command.setName('remove').setDescription('Remove a filter!')
        )
        .addSubcommand((command) =>
          command.setName('clear').setDescription('Clear all filters!')
        )
        .addSubcommand((command) =>
          command.setName('exclude').setDescription('Exclude from all previous filters!')
        )
        .addSubcommand((command) =>
          command
            .setName('current')
            .setDescription('List all your current filters!')
        )
        .addSubcommand((command) =>
          command.setName('list').setDescription('List all the filters!')
        )
    );
  }
}
