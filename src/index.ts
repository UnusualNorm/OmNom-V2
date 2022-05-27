import 'dotenv/config';
import path from 'path';
import Cluster from 'discord-hybrid-sharding';
import { Client } from 'discord-cross-hosting';

// Make sure we have a method to get shard requests (Bridge OR Token)
const serverIP = process.env.SERVER_IP;
const discord_token = process.env.DISCORD_TOKEN;
if (!discord_token) throw new Error('DISCORD_TOKEN not defined in environment...');

// Create the shard manager and log it's actions
const manager = new Cluster.Manager(path.join(__dirname, 'bot.js'), {
  token: discord_token,
});
manager.on('debug', console.debug);
manager.on('clusterCreate', (cluster) =>
  console.info(`Launched new cluster: #${cluster.id}!`)
);

/**
 * Allow for connection to a remote discord-cross-hosting server.
 * Else we just start the manager
 */
if (serverIP) {
  // Make sure we have the required data
  const serverPort = parseInt(process.env.SERVER_PORT) || 4444;
  const serverAuthToken = process.env.SERVER_TOKEN;
  if (!serverAuthToken) throw new Error('SERVER_TOKEN not defined in environment...');

  // Connect to the server
  const client = new Client({
    agent: 'bot',
    host: serverIP,
    port: serverPort,
    authToken: serverAuthToken,
  });
  client.on('debug', console.debug);
  client.connect();

  // Attach server to manage the client
  client.listen(manager);
  client
    .requestShardData()
    .then((e) => {
      // Update our manager with existing data
      if (!e) return;
      if (!e.shardList) return;
      manager.totalShards = e.totalShards;
      manager.totalClusters = e.shardList.length;
      manager.shardList = e.shardList;
      manager.clusterList = e.clusterList;
      manager.spawn({ timeout: -1 });
    })
    .catch(console.error);
} else manager.spawn({ timeout: -1 });
