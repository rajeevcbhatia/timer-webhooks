import { MongoClient } from 'mongodb'
import { DatabaseConnection } from '../src/db/DatabaseConnection'

jest.mock('mongodb')

describe('DatabaseConnection', () => {
  it('should connect to database', async () => {
    const mockConnect = jest.fn()
    MongoClient.prototype.connect = mockConnect

    await DatabaseConnection.connect()

    expect(mockConnect).toHaveBeenCalled()
  })
})
