import express from 'express'
import { DatabaseInitializer } from './db/DatabaseInitializer'
import { DatabaseConnection } from './db/DatabaseConnection'
import TimerService, {
  NotFoundError,
  TimerCreationError,
  ValidationError,
} from './services/TimerService'
import { TimerScheduler } from './scheduler/TimerScheduler'

const app = express()
const port = 8081
app.use(express.json())

const initializeApp = async () => {
  await DatabaseConnection.connect()
  await DatabaseInitializer.initialize()
  TimerScheduler.handleUnfiredTimers()
}

initializeApp()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/timers', async (req, res) => {
  try {
    const response = await TimerService.createStoreAndScheduleTimer(
      +req.body.hours,
      +req.body.minutes,
      +req.body.seconds,
      req.body.url,
    )
    res.json(response)
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).send(error.message)
    } else {
      console.error(error) // Log the unexpected error for debugging
      res.status(500).send('Internal Server Error')
    }
  }
})

app.get('/timers/:id', async (req, res) => {
  try {
    const timerId = req.params.id
    const timerData = await TimerService.getTimer(timerId)
    timerData.time_left = Math.max(timerData.time_left, 0)
    res.json(timerData)
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send(error.message)
    } else if (error instanceof ValidationError) {
      res.status(400).send(error.message)
    } else if (error instanceof TimerCreationError) {
      res.status(500).send('Could not create timer. Please try again.')
    } else {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})
