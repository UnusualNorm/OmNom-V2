// ---------------------------
// ----- CLUSTER MANAGER -----
// ---------------------------

import 'dotenv/config';
import path from 'path';
import Cluster from 'discord-hybrid-sharding';
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
  const guildCount = (
    await manager
      .broadcastEval((c) => c.guilds.cache.size)
      .catch((err) => {
        console.error(err);
        return [0];
      })
  ).reduce((a, b) => a + b);

  const out = await manager
    .broadcastEval(
      `
    this.user.setPresence({
      activities: [
        {
          name: '${guildCount} Servers!',
          type: 'WATCHING'
        }
      ]
    })
  `
    )
    .catch((err) => console.error(err));

  if (!out) return false;
  return out.every((res) => res instanceof ClientPresence);
}
setInterval(updatePresences, 60000);

// ----------------------
// ----- TOR SERVER -----
// ----------------------

import os from 'os';
import cp from 'child_process';
import { TorDownloader } from '@unnusualnorm/tor-downloader';
import hasbin from 'hasbin';

(async () => {
  const startTor = async (torBinaryPath: string): Promise<void> => {
    const torProcess = cp.spawn(torBinaryPath, ['--controlport', '9051']);
    torProcess.on('close', () => startTor(torBinaryPath));

    torProcess.stderr.on('data', (chunk) =>
      console.error(String(chunk).trim())
    );
    torProcess.stdout.on('data', (chunk) => console.log(String(chunk).trim()));
  };

  if (hasbin.sync('tor')) return startTor('tor');

  const torPath = path.join(os.tmpdir(), 'Tor');
  const torDownloader = new TorDownloader();

  await torDownloader.retrieve(torPath);
  await torDownloader.addExecutionRigthsOnTorBinaryFile(torPath);

  const torBinaryPath = path.join(
    torPath,
    torDownloader.getTorBinaryFilename()
  );
  await startTor(torBinaryPath);
})();

// ----------------------------------
// ----- CLUSTER SERVER MANAGER -----
// ----------------------------------

import { Client } from 'discord-cross-hosting';

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
