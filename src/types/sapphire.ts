import Cluster from 'discord-hybrid-sharding';
import MySql from 'mysql';

declare module '@sapphire/framework' {
  interface SapphireClient {
    cluster: Cluster.Client;
    db: MySql.Connection;
  }
}
