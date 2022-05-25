import { SapphireClient } from '@sapphire/framework';
import Cluster from 'discord-hybrid-sharding';

// Make sure we have a token
const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('DISCORD_TOKEN not defined in environment...');

// Create the client with shard integration
const client = new SapphireClient({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  shards: Cluster.data.SHARD_LIST,
  shardCount: Cluster.data.TOTAL_SHARDS,
});

// Attach the cluster and login
client.cluster = new Cluster.Client(client);
client.login(token);
