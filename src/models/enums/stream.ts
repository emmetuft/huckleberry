export enum StreamStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
}

export enum StreamType {
  DONE = 'done',
  METADATA = 'metadata',
  STATUS = 'status',
  STEP_START = 'step_start',
  STEP_COMPLETE = 'step_complete',
  TEXT = 'text',
  TOOL_START = 'tool_start',
  TOOL_RESULT = 'tool_result',
  TOOL_ERROR = 'tool_error',
}
