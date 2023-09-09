import { TimerDetailsConstants } from '../db/DbConstants'

export interface TimerDetails {
  [TimerDetailsConstants.DUE_TIMESTAMP_COLUMN]: number
  [TimerDetailsConstants.WEBHOOK_URL_COLUMN]: string
  [TimerDetailsConstants.IS_FIRED_COLUMN]: boolean
}
