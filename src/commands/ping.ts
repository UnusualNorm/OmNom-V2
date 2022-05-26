import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command, CommandOptions } from '@sapphire/framework';
import { ApplicationCommandType } from 'discord-api-types/v10';

ApplyOptions<CommandOptions>({
  name: 'ping',
  description: "Ping the bot to see if it's alive!",
  chatInputCommand: {
    register: true,
  },
});

export class PingCommand extends Command {
  async ping(
    interaction: Command.ChatInputInteraction | Command.ContextMenuInteraction
  ) {
    // Reply to the interaction to guage the ping
    const msg = await interaction.reply({
      content: `Ping?`,
      ephemeral: true,
      fetchReply: true,
    });

    // Make sure we have a Message, not an APIMessage
    if (isMessageInstance(msg)) {
      // Calculate the ping
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);

      // Update the interaction reply with ping
      return interaction.editReply(
        `Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`
      );
    }

    // The interaction "failed" to send
    return interaction.editReply('Failed to retrieve ping :(');
  }

  chatInputRun(interaction: Command.ChatInputInteraction) {
    return this.ping(interaction);
  }

  contextMenuRun(interaction: Command.ContextMenuInteraction) {
    return this.ping(interaction);
  }

  registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand((builder) =>
      builder.setName('ping').setType(ApplicationCommandType.Message)
    );

    registry.registerChatInputCommand((builder) =>
      builder
        .setName('ping')
        .setDescription("Ping the bot to see if it's alive!")
    );
  }
}
