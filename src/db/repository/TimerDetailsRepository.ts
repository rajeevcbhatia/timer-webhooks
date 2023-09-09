import { DatabaseConnection } from '../DatabaseConnection'
import { TimerDetailsConstants } from '../DbConstants'
import { TimerDetails } from '../../models/TimerDetails'

class TimerDetailsRepository {
  async createTimer(timer: TimerDetails) {
    return await DatabaseConnection.database
      .collection(TimerDetailsConstants.TABLE_NAME)
      .insertOne(timer)
  }
}

export default new TimerDetailsRepository()
