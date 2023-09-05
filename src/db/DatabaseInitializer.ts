import sqlite3 from 'sqlite3';
import { CountersConstants, ID_COLUMN, TimerDetailsConstants } from './dbConstants';

export class DatabaseInitializer {
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

    // Create TimerDetails table if it doesn't exist
    const createTimerDetailsTableSQL = `
        CREATE TABLE IF NOT EXISTS ${TimerDetailsConstants.TABLE_NAME} (
        ${ID_COLUMN} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${TimerDetailsConstants.DUE_TIMESTAMP_COLUMN} INTEGER NOT NULL,
        ${TimerDetailsConstants.WEBHOOK_URL_COLUMN} TEXT NOT NULL
        );
    `;

    db.run(createTimerDetailsTableSQL, (err) => {
      if (err) {
        console.error(err.message);
      }
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

  private static initializeMongoDB() {
    // MongoDB initialization logic here
  }

  private static initializeRedis() {
    // Redis initialization logic here
  }
}
