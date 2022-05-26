import Cluster from 'discord-hybrid-sharding';
import MySql from 'mysql2';

declare module '@sapphire/framework' {
  interface SapphireClient {
    cluster: Cluster.Client;
    db: MySql.Connection;
  }
}
