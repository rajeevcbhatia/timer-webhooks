import express from 'express'
import { DatabaseInitializer } from './db/DatabaseInitializer'
import { DatabaseConnection } from './db/DatabaseConnection'
import { TimerDetailsConstants } from './db/dbConstants'

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
    if (
      !req.body.hours ||
      isNaN(req.body.hours) ||
      !req.body.minutes ||
      isNaN(req.body.minutes) ||
      !req.body.seconds ||
      isNaN(req.body.seconds) ||
      !req.body.url
    ) {
      // Send an error response or handle it accordingly
      res.status(400).send('Invalid input')
      return
    }

    const hours = Number(req.body.hours)
    const minutes = Number(req.body.minutes)
    const seconds = Number(req.body.seconds)
    const url = String(req.body.url)

    // Calculate dueTimestamp
    const currentTime = Math.floor(Date.now() / 1000) // current time in seconds
    const dueTimestamp = currentTime + hours * 3600 + minutes * 60 + seconds

    // Create timer object
    const timer = {
      dueTimestamp: dueTimestamp,
      url: url,
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
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})
