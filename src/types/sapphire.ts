import Cluster from 'discord-hybrid-sharding';

declare module '@sapphire/framework' {
  interface SapphireClient {
    cluster: Cluster.Client;
  }
}
