import path from "path";
import "dotenv/config";
import { Client } from "discord-cross-hosting";
import Cluster from "discord-hybrid-sharding";

const serverIP = process.env.SERVER_IP;
const token = process.env.DISCORD_TOKEN;
if (!token && !serverIP) throw new Error('DISCORD_TOKEN not defined in environment...');

const manager = new Cluster.Manager(path.join(__dirname, "bot.ts"), {
  token,
});

manager.on("debug", console.debug);
manager.on("clusterCreate", (cluster) =>
  console.info(`Launched new cluster: #${cluster.id}!`)
);

/**
 * Allow for connection to remote cluster management server.
 */
if (serverIP) {
  const serverPort = parseInt(process.env.SERVER_PORT) || 4444;
  const authToken = process.env.SERVER_TOKEN;
  if (!authToken) throw new Error("SERVER_TOKEN not defined in environment...");

  const client = new Client({
    agent: "bot",
    host: serverIP,
    port: serverPort,
    authToken,
  });
  client.on("debug", console.debug);
  client.connect();

  client.listen(manager);
  client
    .requestShardData()
    .then((e) => {
      if (!e) return;
      if (!e.shardList) return;
      manager.totalShards = e.totalShards;
      manager.totalClusters = e.shardList.length;
      manager.shardList = e.shardList;
      manager.clusterList = e.clusterList;
      manager.spawn({ timeout: -1 });
    })
    .catch((e) => console.log(e));
}
