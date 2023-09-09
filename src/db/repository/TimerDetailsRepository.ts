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
          returnDocument: 'before', // this will ensure you get the original document before the update
        },
      )

    console.log('findOneAndUpdate result:', result) // Log the entire result object

    return result // this will return the original document before the update was applied
  }
}

export default new TimerDetailsRepository()
