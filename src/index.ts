import 'dotenv/config';
import path from 'path';
import Cluster from 'discord-hybrid-sharding';
import { Client } from 'discord-cross-hosting';
import { installTor } from './utils';
import { ClientPresence } from 'discord.js';

const discordToken = process.env.DISCORD_TOKEN;
if (!discordToken) throw new Error('No Discord token found... (DISCORD_TOKEN)');

const manager = new Cluster.Manager(path.join(__dirname, 'bot.js'), {
  token: discordToken,
});
manager.on('debug', console.debug);
manager.on('clusterCreate', (cluster) => 
  cluster.on('ready', () => {
    console.info(`Launched new cluster: #${cluster.id}!`);
    updatePresences();
  })
);

async function updatePresences() {
  const out = await manager.broadcastEval((c) =>
    c.user.setPresence({
      activities: [
        {
          name: `${c.guilds.cache.size} Servers "Very Carefully"!`,
          type: 'WATCHING',
        },
      ],
    })
  ).catch(err => console.error(err));
  
  if (!out) return false;
  return out.every((res) => res instanceof ClientPresence);
}
setInterval(updatePresences, 60000);

installTor().then(() => console.warn('Tor process exited...'));

const serverIP = process.env.SERVER_IP;
if (serverIP) {
  const serverPort = parseInt(process.env.SERVER_PORT) || 4444;
  const serverAuthToken = process.env.SERVER_TOKEN;
  if (!serverAuthToken)
    throw new Error('No server authentication token found... (SERVER_TOKEN)');

  const client = new Client({
    agent: 'bot',
    host: serverIP,
    port: serverPort,
    authToken: serverAuthToken,
  });
  client.on('debug', console.debug);
  client.connect();

  client.listen(manager);
  client
    .requestShardData()
    .then((e) => {
      if (!e) return;
      if (!e.shardList) return;

      // The shard client doesn't automatically update with the existing data
      // We need to do that manually
      manager.totalShards = e.totalShards;
      manager.totalClusters = e.shardList.length;
      manager.shardList = e.shardList;
      manager.clusterList = e.clusterList;
      manager.spawn({ timeout: -1 });
    })
    .catch(console.error);
} else manager.spawn({ timeout: -1 });
