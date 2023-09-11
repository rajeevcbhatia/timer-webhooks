import axios from 'axios'
import TimerDetailsRepository from '../src/db/repository/TimerDetailsRepository'
import { TimerScheduler } from '../src/scheduler/TimerScheduler'
import { ObjectId } from 'mongodb'
import { DatabaseConnection } from '../src/db/DatabaseConnection'

jest.mock('axios')
axios.post = jest.fn()

jest.mock('../src/db/DatabaseConnection')

describe('TimerScheduler', () => {
  let mockFind: jest.Mock
  let mockFindOneAndUpdate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    mockFind = jest.fn()
    mockFindOneAndUpdate = jest.fn()

    const mockCollection = {
      find: mockFind,
      findOneAndUpdate: mockFindOneAndUpdate,
    }

    mockFindOneAndUpdate.mockResolvedValue({
      _id: new ObjectId(),
      dueTimeStamp: Date.now() / 1000 - 10, // 10 seconds ago
      webhookURL: 'http://example.com',
      isFired: false,
    })

    Object.defineProperty(DatabaseConnection, 'database', {
      get: jest.fn(() => ({ collection: jest.fn(() => mockCollection) })),
      configurable: true,
    })
  })

  it('should fire past due timers', async () => {
    const pastTimer = {
      _id: new ObjectId(),
      dueTimeStamp: Date.now() / 1000 - 10, // 10 seconds ago
      webhookURL: 'http://example.com',
      isFired: false,
    }

    TimerDetailsRepository.getUnfiredTimers = jest
      .fn()
      .mockResolvedValue([pastTimer])
    mockFind.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([pastTimer]),
    })

    await TimerScheduler.handleUnfiredTimers()

    expect(axios.post).toHaveBeenCalledWith(
      `${pastTimer.webhookURL}/${pastTimer._id}`,
    )
  })

  it('should not fire future timers immediately', async () => {
    const futureTimer = {
      _id: new ObjectId(),
      dueTimeStamp: Date.now() / 1000 + 10, // 10 seconds in the future
      webhookURL: 'http://example.com',
      isFired: false,
    }

    TimerDetailsRepository.getUnfiredTimers = jest
      .fn()
      .mockResolvedValue([futureTimer])
    mockFind.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([futureTimer]),
    })

    await TimerScheduler.handleUnfiredTimers()

    expect(axios.post).not.toHaveBeenCalled()
  })
})
