import { SapphireClient } from '@sapphire/framework';
import MySql from 'mysql2';
import Cluster from 'discord-hybrid-sharding';

// Make sure we have a token
const discordToken = process.env.DISCORD_TOKEN;
if (!discordToken)
  throw new Error('DISCORD_TOKEN not defined in environment...');

// Create the client with shard integration
const client = new SapphireClient({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
  shards: Cluster.data.SHARD_LIST,
  shardCount: Cluster.data.TOTAL_SHARDS,
  fetchPrefix: () => process.env.DISCORD_PREFIX || '~',
});

// Attach the cluster and login
client.cluster = new Cluster.Client(client);
client.login(discordToken);

// Connect to database
const db = MySql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Attach database to client
db.connect();
client.db = db;
