import { ApplyOptions } from '@sapphire/decorators';
import { Command, RegisterBehavior } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'ping',
  description: "Ping the bot to see if it's alive!",
  chatInputCommand: {
    register: true,
    behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
  },
})
export class PingCommand extends Command {
  async chatInputRun(interaction: Command.ChatInputInteraction) {
    const msg = await interaction.reply({
      content: `Ping?`,
      ephemeral: true,
      fetchReply: true,
    });

    if (msg instanceof Message) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp;
      const ping = Math.round(this.container.client.ws.ping);

      return interaction.editReply(
        `Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`
      );
    }
  }
}
