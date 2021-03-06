import 'dotenv/config';
import { Bridge } from 'discord-cross-hosting';

const totalMachines = parseInt(process.env.TOTAL_MACHINES) || 2;
const port = parseInt(process.env.SERVER_PORT) || 4444;

const authToken = process.env.SERVER_TOKEN;
if (!authToken)
  throw new Error('No server authentication token found... (SERVER_TOKEN)');

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('No Discord token found... (DISCORD_TOKEN)');

const server = new Bridge({
  port,
  authToken,
  totalMachines,
  token,
});

server.on('debug', console.debug);
server.on('connect', (client) =>
  console.info(`New shard connected: #${client.id}!`)
);
server.on('disconnect', (client) =>
  console.warn(`Client #${client.id} disconnected...`)
);
server.on('ready', (url) => console.info(`Server is ready: "${url}"!`));

server.start();
