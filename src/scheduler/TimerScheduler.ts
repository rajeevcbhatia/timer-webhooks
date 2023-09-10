import axios, { AxiosError } from 'axios'
import TimerDetailsRepository from '../db/repository/TimerDetailsRepository'
import { ObjectId } from 'mongodb'

export class TimerScheduler {
  static schedule(timerId: ObjectId, timeLeft: number, webhookURL: string) {
    setTimeout(async () => {
      console.log('attempting to fire timer')
      const timer = await TimerDetailsRepository.setIsFiredIfNotAlready(timerId)
      console.log(timer)
      if (timer && !timer.isFired) {
        console.log('TIMER FIRED')
        try {
          await axios.post(`${webhookURL}/${timerId}`)
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
              axiosError.response.data,
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
          console.error(axiosError.config)
        }
      }
    }, timeLeft * 1000)
  }
}
