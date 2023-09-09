import { DatabaseConnection } from '../DatabaseConnection'
import { TimerDetailsConstants } from '../DbConstants'
import { TimerDetails } from '../../models/TimerDetails'
import { ObjectId } from 'mongodb'

class TimerDetailsRepository {
  async createTimer(timer: TimerDetails) {
    return await DatabaseConnection.database
      .collection(TimerDetailsConstants.TABLE_NAME)
      .insertOne(timer)
  }

  async getTimer(id: ObjectId) {
    return await DatabaseConnection.database
      .collection(TimerDetailsConstants.TABLE_NAME)
      .findOne({ _id: id })
  }
}

export default new TimerDetailsRepository()
