import { Command, RegisterBehavior } from '@sapphire/framework';
import { EmbedAuthorData, MessageEmbed, MessageEmbedFooter } from 'discord.js';
import { getFakeFace } from '../utils/thispersondoesnotexist';
import { ReFetch } from '../utils/tor';

export interface UrbanEntry {
  definition: string;
  permalink: string;
  thumbs_up: number;
  sound_urls: string[];
  author: string;
  word: string;
  defid: number;
  current_vote: string;
  written_on: string;
  example: string;
  thumbs_down: number;
}

export class UrbanCommand extends Command {
  async chatInputRun(interaction: Command.ChatInputInteraction) {
    try {
      await interaction.deferReply();
      const fakeFaceRequest = getFakeFace();
      const term = interaction.options.getString('term');

      const url = `http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(
        term
      )}`;
      const out = await ReFetch(url);
      const res: { list: UrbanEntry[] } = JSON.parse(out);

      const entry = res.list[0];
      if (!entry) return interaction.editReply('No definition found :(');

      // Some words are surrounded by square brackets,
      const definition = entry.definition.replace(/\[.*\]/, (word) =>
        word.replace(/\[|\]/g, '')
      );
      const example = entry.example.replace(/\[|\]/g, (word) =>
        word.replace(/\[|\]/g, '')
      );

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
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName('urban')
          .setDescription('Look up a definition from the Urban Dictionary!')
          .addStringOption((option) =>
            option
              .setRequired(true)
              .setName('term')
              .setDescription('The term to lookup!')
          ),
      {
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }
}
