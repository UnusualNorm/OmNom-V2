import Cluster from 'discord-hybrid-sharding';
import { MySQL2Extended } from 'mysql2-extended';

declare module '@sapphire/framework' {
  interface SapphireClient {
    cluster: Cluster.Client;
    db: MySQL2Extended;
  }
}
