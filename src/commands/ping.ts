import { ApplyOptions } from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command, CommandOptions } from '@sapphire/framework';

ApplyOptions<CommandOptions>({
  name: 'ping',
  description: 'Ping bot to see if it is alive',
  chatInputCommand: {
    register: true,
  },
});
export class PingCommand extends Command {
  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    // Let the user know we recieved the action
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
}
