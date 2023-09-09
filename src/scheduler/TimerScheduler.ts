import axios from 'axios'
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
        await axios.post(`${webhookURL}/${timerId}`)
      }
    }, timeLeft * 1000)
  }
}
