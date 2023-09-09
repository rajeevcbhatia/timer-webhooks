import { TimerDetailsConstants } from '../db/dbConstants'

export interface TimerDetails {
  [TimerDetailsConstants.DUE_TIMESTAMP_COLUMN]: number
  [TimerDetailsConstants.WEBHOOK_URL_COLUMN]: string
  [TimerDetailsConstants.IS_FIRED_COLUMN]: boolean
}
