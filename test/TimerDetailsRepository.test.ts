import TimerDetailsRepository from '../src/db/repository/TimerDetailsRepository'
import { ObjectId } from 'mongodb'

jest.mock('mongodb') // Mock the mongodb module
jest.mock('../src/db/DatabaseConnection', () => {
  const originalModule = jest.requireActual('../src/db/DatabaseConnection')

  return {
    ...originalModule,
    DatabaseConnection: {
      ...originalModule.DatabaseConnection,
      get database() {
        return {
          collection: jest.fn().mockReturnValue({
            insertOne: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            find: jest.fn().mockReturnValue({
              toArray: jest.fn(),
            }),
          }),
        }
      },
    },
  }
})

describe('TimerDetailsRepository', () => {
  let mockCollection: any

  beforeEach(() => {
    mockCollection =
      require('../src/db/DatabaseConnection').DatabaseConnection.database.collection()
  })

  it('should create a timer', async () => {
    const timerData = {
      dueTimeStamp: Date.now() + 10000,
      webHookURL: 'https://example.com',
      isFired: false,
    }

    await TimerDetailsRepository.createTimer(timerData)
    expect(mockCollection.insertOne).toHaveBeenCalledWith(timerData)
  })

  it('should fetch a timer by ID', async () => {
    const id = new ObjectId()
    await TimerDetailsRepository.getTimer(id)
    expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: id })
  })

  it('should set timer as fired if not already fired', async () => {
    const id = new ObjectId()
    await TimerDetailsRepository.setIsFiredIfNotAlready(id)
    expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: id,
        isFired: false,
      },
      {
        $set: { isFired: true },
      },
      {
        returnDocument: 'before',
      },
    )
  })
})
