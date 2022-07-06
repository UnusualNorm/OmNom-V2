import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { MessageEmbed, MessageReaction, User } from 'discord.js';
import { ReFetch } from '../utils/tor';

type ReverseImageOutput = {
  title: string;
  url?: string;
}[];

@ApplyOptions<Listener.Options>({
  name: 'Image Source',
  enabled: true,
  event: 'messageReactionAdd',
})
export class ImageSourceListener extends Listener {
  async run(messageReaction: MessageReaction, user: User) {
    if (messageReaction.partial) await messageReaction.fetch();
    if (messageReaction.emoji.name != '🔍') return;

    const images = new Array<string>();
    if (messageReaction.message.partial) await messageReaction.message.fetch();
    if (messageReaction.message.author.id == this.container.client.user.id)
      return;

    images.push(
      ...messageReaction.message.embeds
        .filter((embed) => embed.thumbnail?.proxyURL)
        .map((embed) => embed.thumbnail.proxyURL)
    );

    images.push(
      ...messageReaction.message.attachments
        .filter((attachment) => attachment.contentType.startsWith('image/'))
        .map((attachment) => attachment.proxyURL)
    );

    if (images.length == 0) return;
    const dms = await user.createDM();
    dms.send('Fetching similiar images...');

    for (const image of images) {
      const embed = new MessageEmbed();
      embed.setTitle('Visually Similar Images');
      embed.setURL(
        `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(
          image
        )}`
      );
      embed.setImage(image);

      const res = await ReFetch(
        `https://node-reverse-image-search.herokuapp.com/?imageUrl=${encodeURIComponent(
          image
        )}`
      );
      if (!res) {
        embed.setDescription('No similiar images found... :(');
        dms.send({
          embeds: [embed],
        });
        continue;
      }
      const json: ReverseImageOutput = JSON.parse(res);
      json.shift();

      for (const { title, url } of json) embed.addField(title, url);
      dms.send({
        embeds: [embed],
      });
    }
  }
}
