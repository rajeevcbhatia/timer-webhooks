import axios, { AxiosError } from 'axios'
import TimerDetailsRepository from '../db/repository/TimerDetailsRepository'
import { ObjectId } from 'mongodb'

export class TimerScheduler {
  static schedule(timerId: ObjectId, timeLeft: number) {
    setTimeout(async () => {
      this.fireTimer(timerId)
    }, timeLeft * 1000)
  }

  static async handleUnfiredTimers() {
    try {
      // Fetch all unfired timers
      console.log('Fetching timers')
      const unfiredTimers = await TimerDetailsRepository.getUnfiredTimers()
      console.log(unfiredTimers)
      const now = Math.floor(Date.now() / 1000)

      for (const timer of unfiredTimers) {
        if (timer.dueTimeStamp <= now) {
          // Handle expired timers
          await this.fireTimer(timer._id)
        } else {
          // Schedule future timers
          const timeLeft = timer.dueTimeStamp - now
          TimerScheduler.schedule(timer._id, timeLeft)
        }
      }
    } catch (error) {
      console.error('Error handling unfired timers on startup:', error)
    }
  }

  private static async fireTimer(id: ObjectId) {
    const timer = await TimerDetailsRepository.setIsFiredIfNotAlready(id)
    if (timer && !timer.isFired) {
      console.log('Firing timer ' + id.toString())
      try {
        await axios.post(`${timer.webhookURL}/${id}`)
      } catch (error) {
        /*
          Error handling strategies:-
            1. Retrying failed requests
            2. Logging and monitoring 
            3. storing post status in DB for audit trails
           */
        const axiosError = error as AxiosError
        if (axiosError.response) {
          // Response was received with error
          console.error(
            'Server responded with an error:',
            axiosError.response.statusText,
          )
        } else if (axiosError.request) {
          // No response but request was made
          console.error(
            'No response received from the server:',
            axiosError.request,
          )
        } else {
          // Something went wrong with the request
          console.error('Error setting up the request:', axiosError.message)
        }
        // Log more details if needed
        // console.error(axiosError.config)
      }
    }
  }
}
