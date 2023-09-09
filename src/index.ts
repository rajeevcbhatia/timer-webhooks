import express from 'express'
import { DatabaseInitializer } from './db/DatabaseInitializer'
import { DatabaseConnection } from './db/DatabaseConnection'
import TimerService, { ValidationError } from './services/TimerService'

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
    const response = await TimerService.createAndStoreTimer(
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})
