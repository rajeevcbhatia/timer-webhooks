import express from 'express'
import { DatabaseInitializer } from './db/DatabaseInitializer'
import { DatabaseConnection } from './db/DatabaseConnection'
import { TimerDetailsConstants } from './db/dbConstants'
import { MongoServerError } from 'mongodb'
import { TimerDetails } from './models/TimerDetails'

const app = express()
const port = 8081
app.use(express.json())

DatabaseConnection.connect()
DatabaseInitializer.initialize()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/timers', async (req, res) => {
  try {
    const {
      hours: rawHours,
      minutes: rawMinutes,
      seconds: rawSeconds,
      url,
    } = req.body

    const hours = +rawHours
    const minutes = +rawMinutes
    const seconds = +rawSeconds

    console.log('hours:', hours)
    console.log('minutes:', minutes)
    console.log('seconds:', seconds)
    console.log('url:', url)

    if (![hours, minutes, seconds].every(Number.isFinite) || !url) {
      res.status(400).send('Invalid input')
      return
    }

    const dueTimestamp =
      Math.floor(Date.now() / 1000) + hours * 3600 + minutes * 60 + seconds

    // Create timer object
    const timer: TimerDetails = {
      dueTimeStamp: dueTimestamp,
      webHookURL: url,
      isFired: false,
    }

    // Insert into MongoDB
    const result = await DatabaseConnection.database
      .collection(TimerDetailsConstants.TABLE_NAME)
      .insertOne(timer)

    // Respond with the inserted timer along with its _id
    res.json({
      id: result.insertedId,
      time_left: dueTimestamp - Math.floor(Date.now() / 1000),
    })
  } catch (error) {
    if (
      error instanceof MongoServerError &&
      error.errInfo &&
      error.errInfo.details
    ) {
      console.log(
        'Missing properties:',
        error.errInfo.details.schemaRulesNotSatisfied[0].missingProperties,
      )
    } else {
      console.log(error)
    }
    res.status(500).send('Internal Server Error')
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})
