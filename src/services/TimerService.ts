import TimerDetailsRepository from '../db/repository/TimerDetailsRepository'
import { TimerDetails } from '../models/TimerDetails'
import { TimerDetailsConstants } from '../db/DbConstants'

export class ValidationError extends Error {}

class TimerService {
  async createAndStoreTimer(
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

    return {
      [TimerDetailsConstants.ID]: result.insertedId,
      [TimerDetailsConstants.TIME_LEFT]:
        dueTimestamp - Math.floor(Date.now() / 1000),
    }
  }
}

export default new TimerService()
