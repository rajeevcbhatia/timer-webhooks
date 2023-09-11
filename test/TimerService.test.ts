import TimerService, {
  ValidationError,
  TimerCreationError,
} from '../src/services/TimerService'
import TimerDetailsRepository from '../src/db/repository/TimerDetailsRepository'
import { TimerScheduler } from '../src/scheduler/TimerScheduler'
import { ObjectId } from 'mongodb'

jest.mock('../src/db/repository/TimerDetailsRepository')
jest.mock('../src/scheduler/TimerScheduler')

const mockedCreateTimer =
  TimerDetailsRepository.createTimer as jest.MockedFunction<
    typeof TimerDetailsRepository.createTimer
  >
const mockedSchedule = TimerScheduler.schedule as jest.MockedFunction<
  typeof TimerScheduler.schedule
>

describe('TimerService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createStoreAndScheduleTimer', () => {
    it('should throw a ValidationError for invalid inputs', async () => {
      await expect(
        TimerService.createStoreAndScheduleTimer(
          undefined as never,
          1,
          1,
          'http://example.com',
        ),
      ).rejects.toThrow(ValidationError)
    })

    it('should throw a ValidationError for time being zero', async () => {
      await expect(
        TimerService.createStoreAndScheduleTimer(0, 0, 0, 'http://example.com'),
      ).rejects.toThrow(ValidationError)
    })

    it('should throw a ValidationError for negative time', async () => {
      await expect(
        TimerService.createStoreAndScheduleTimer(
          -1,
          0,
          0,
          'http://example.com',
        ),
      ).rejects.toThrow(ValidationError)
    })

    it('should throw TimerCreationError when creation is not acknowledged', async () => {
      mockedCreateTimer.mockResolvedValue({
        acknowledged: false,
        insertedId: new ObjectId(),
      })
      await expect(
        TimerService.createStoreAndScheduleTimer(1, 1, 1, 'http://example.com'),
      ).rejects.toThrow(TimerCreationError)
    })

    it('should create and schedule a timer successfully', async () => {
      mockedCreateTimer.mockResolvedValue({
        acknowledged: true,
        insertedId: new ObjectId('507f1f77bcf86cd799439011'),
      })

      const result = await TimerService.createStoreAndScheduleTimer(
        1,
        1,
        1,
        'http://example.com',
      )

      expect(result).toBeDefined()
      expect(result.id.toString()).toBe('507f1f77bcf86cd799439011')
      expect(mockedSchedule).toHaveBeenCalledTimes(1)
    })
  })
})
