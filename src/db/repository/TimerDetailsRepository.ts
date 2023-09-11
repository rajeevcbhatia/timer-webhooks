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

  async setIsFiredIfNotAlready(timerId: ObjectId) {
    const result = await DatabaseConnection.database
      .collection(TimerDetailsConstants.TABLE_NAME)
      .findOneAndUpdate(
        {
          _id: timerId,
          isFired: false,
        },
        {
          $set: { isFired: true },
        },
        {
          returnDocument: 'before', // because we want the original object
        },
      )

    console.log('findOneAndUpdate result:', result)

    return result // this will return the original document before the update was applied
  }

  async getUnfiredTimers() {
    return await DatabaseConnection.database
      .collection(TimerDetailsConstants.TABLE_NAME)
      .find({ isFired: false })
      .toArray()
  }
}

export default new TimerDetailsRepository()
