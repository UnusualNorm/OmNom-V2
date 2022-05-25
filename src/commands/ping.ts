import {ApplyOptions} from '@sapphire/decorators';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command, CommandOptions } from '@sapphire/framework';

ApplyOptions<CommandOptions>({
    name: 'ping',
    description: 'Ping bot to see if it is alive',
    chatInputCommand: {
        register: true
    }
});
export class PingCommand extends Command {

  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    const msg = await interaction.reply({ content: `Ping?`, ephemeral: true, fetchReply: true });

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);
      return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
    }

    return interaction.editReply('Failed to retrieve ping :(');
  }
}