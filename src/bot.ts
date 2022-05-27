import { SapphireClient } from '@sapphire/framework';
import MySQL2 from 'mysql2/promise';
import { MySQL2Extended } from 'mysql2-extended';
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

// Create a database pool
const dbPool = MySQL2.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect and attach to database
const db = new MySQL2Extended(dbPool);
client.db = db;

// Update the bot presence
const updatePresence = async () => {
  // Make sure we're the main cluster
  if (client.cluster.id === 0) {
    // Get a count of all guilds across shards and clusters
    const guildCount = client.cluster.broadcastEval((c) =>
      c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    );

    // Set the presence
    client.user.presence.set({
      activities: [
        {
          type: 'WATCHING',
          name: `over ${await guildCount} servers!`,
          url: 'https://twitch.tv/unusualnorm',
        },
      ],
    });
  }
}
updatePresence();

// Every 10 minutes, update the bot presence
setInterval(updatePresence, 10 * 60 * 1000);