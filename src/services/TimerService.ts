import TimerDetailsRepository from '../db/repository/TimerDetailsRepository'
import { TimerDetails } from '../models/TimerDetails'
import { TimerDetailsConstants } from '../db/DbConstants'
import { ObjectId } from 'mongodb'
import { TimerScheduler } from '../scheduler/TimerScheduler'

export class ValidationError extends Error {}
export class NotFoundError extends Error {}
export class TimerCreationError extends Error {}

class TimerService {
  async createStoreAndScheduleTimer(
    hours: number,
    minutes: number,
    seconds: number,
    url: string,
  ) {
    if (![hours, minutes, seconds].every(Number.isFinite) || !url) {
      throw new ValidationError('Invalid input')
    }
    if (hours == 0 && minutes == 0 && seconds == 0) {
      throw new ValidationError('Time is 0')
    }
    if (hours < 0 || minutes < 0 || seconds < 0) {
      throw new ValidationError('Time travel not yet invented')
    }

    const dueTimestamp =
      Math.floor(Date.now() / 1000) + hours * 3600 + minutes * 60 + seconds

    const timer: TimerDetails = {
      [TimerDetailsConstants.DUE_TIMESTAMP_COLUMN]: dueTimestamp,
      [TimerDetailsConstants.WEBHOOK_URL_COLUMN]: url,
      [TimerDetailsConstants.IS_FIRED_COLUMN]: false,
    }

    const result = await TimerDetailsRepository.createTimer(timer)

    if (result.acknowledged) {
      const insertedId = result.insertedId
      TimerScheduler.schedule(
        insertedId,
        dueTimestamp - Math.floor(Date.now() / 1000),
      )
      return {
        [TimerDetailsConstants.ID]: result.insertedId,
        [TimerDetailsConstants.TIME_LEFT]:
          dueTimestamp - Math.floor(Date.now() / 1000),
      }
    } else {
      throw new TimerCreationError('Timer creation was not acknowledged.')
    }
  }

  async getTimer(timerId: string) {
    // Fetch the timer from the database
    let objectId

    try {
      objectId = new ObjectId(timerId)
    } catch (error) {
      throw new ValidationError('Invalid ID format')
    }
    const timer = await TimerDetailsRepository.getTimer(objectId)

    if (!timer) {
      throw new NotFoundError('Timer not found')
    }

    // Calculate the remaining time
    const currentTime = Math.floor(Date.now() / 1000)
    const timeLeft = timer.dueTimeStamp - currentTime

    // Send the response
    const response = {
      [TimerDetailsConstants.ID]: timerId,
      [TimerDetailsConstants.TIME_LEFT]: timeLeft,
    }

    return response
  }
}

export default new TimerService()
