import { Db, MongoClient } from 'mongodb'

const DATABASE_NAME = 'TimerServiceDB'

export class DatabaseConnection {
  private static client: MongoClient
  private static db: Db

  public static async connect() {
    const mongoDBConnectionString = 'mongodb://127.0.0.1:27017/'
    this.client = new MongoClient(mongoDBConnectionString)
    await this.client.connect()
    this.db = this.client.db(DATABASE_NAME)
  }

  public static get database() {
    return this.db
  }

  public static async disconnect() {
    await this.client.close()
  }
}
