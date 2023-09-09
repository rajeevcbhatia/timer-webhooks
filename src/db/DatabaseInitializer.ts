import { DatabaseConnection } from './DatabaseConnection'
import { TimerDetailsConstants } from './DbConstants'
import { MongoClient } from 'mongodb'

export class DatabaseInitializer {
  private static client: MongoClient
  public static initialize() {
    this.initializeMongoDB()
  }

  private static async initializeMongoDB() {
    await DatabaseConnection.connect()
    // Check if the collection already exists
    const collections = await DatabaseConnection.database
      .listCollections({ name: TimerDetailsConstants.TABLE_NAME })
      .toArray()
    console.log('COLLECTIONS')
    console.log(collections.length)
    if (collections.length === 0) {
      // Create the collection with the validator if it doesn't exist
      await DatabaseConnection.database.createCollection(
        TimerDetailsConstants.TABLE_NAME,
        {
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: [
                TimerDetailsConstants.DUE_TIMESTAMP_COLUMN,
                TimerDetailsConstants.WEBHOOK_URL_COLUMN,
                TimerDetailsConstants.IS_FIRED_COLUMN,
              ],
              properties: {
                [TimerDetailsConstants.DUE_TIMESTAMP_COLUMN]: {
                  bsonType: 'int',
                },
                [TimerDetailsConstants.WEBHOOK_URL_COLUMN]: {
                  bsonType: 'string',
                },
                [TimerDetailsConstants.IS_FIRED_COLUMN]: {
                  bsonType: 'bool',
                },
              },
            },
          },
        },
      )
    }
  }
}
