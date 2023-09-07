import sqlite3 from 'sqlite3';
import { CountersConstants, ID_COLUMN, TimerDetailsConstants } from './dbConstants';
import { isRowCount } from './RowCount';
import { MongoClient } from 'mongodb';

const DATABASE_NAME = "TimerServiceDB";

export class DatabaseInitializer {

  private static client: MongoClient;
  public static initialize() {
    this.initializeMongoDB();
    this.initializeRedis();
    this.initializeSQLite();
  }

  private static initializeSQLite() {
    const db = new sqlite3.Database('timerstate.db', (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the SQLite database.');
    });

    // Create Counters table if it doesn't exist
    const createCountersTableSQL = `
    CREATE TABLE IF NOT EXISTS ${CountersConstants.TABLE_NAME} (
    ${CountersConstants.COUNT_COLUMN} INTEGER NOT NULL
    );
    `;

    db.run(createCountersTableSQL, function (err) {
      if (err) {
        console.error(err.message);
      } else {
        // Check if the table is empty
        db.get(`SELECT COUNT(*) as count FROM ${CountersConstants.TABLE_NAME}`, (err, row) => {
          if (err) {
            console.error(err.message);
          }

          // If table is empty, insert default value
          if (isRowCount(row) && row.count === 0) {
            db.run(
              `INSERT INTO ${CountersConstants.TABLE_NAME} (${CountersConstants.COUNT_COLUMN}) VALUES (0);`,
              (err) => {
                if (err) {
                  console.error(err.message);
                }
              },
            );
          }
        });
      }
    });

    // Close the database
    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Closed the database connection.');
    });
  }

  private static async initializeMongoDB() {
    // Replace the string below with your actual MongoDB connection string
    const mongoDBConnectionString = "mongodb://127.0.0.1:27017/"; // For local development
    // const mongoDBConnectionString = "your_production_connection_string_here"; // For production

    this.client = new MongoClient(mongoDBConnectionString);
    await this.client.connect();

    const db = this.client.db(DATABASE_NAME);

    // Check if the collection already exists
    const collections = await db.listCollections({ name: TimerDetailsConstants.TABLE_NAME }).toArray();
    console.log('COLLECTIONS')
    console.log(collections.length)
    if (collections.length === 0) {
        // Create the collection with the validator if it doesn't exist
        await db.createCollection(TimerDetailsConstants.TABLE_NAME, {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: [
                        ID_COLUMN,
                        TimerDetailsConstants.DUE_TIMESTAMP_COLUMN,
                        TimerDetailsConstants.WEBHOOK_URL_COLUMN,
                        TimerDetailsConstants.IS_FIRED_COLUMN
                    ],
                    properties: {
                        [ID_COLUMN]: {
                            bsonType: "string"
                        },
                        [TimerDetailsConstants.DUE_TIMESTAMP_COLUMN]: {
                            bsonType: "int"
                        },
                        [TimerDetailsConstants.WEBHOOK_URL_COLUMN]: {
                            bsonType: "string"
                        },
                        [TimerDetailsConstants.IS_FIRED_COLUMN]: {
                            bsonType: "bool"
                        }
                    }
                }
            }
        });
    }
}


  private static initializeRedis() {
    // Redis initialization logic here
  }
}
