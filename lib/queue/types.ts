export interface JobQueue {
  enqueue(jobType: string, payload: Record<string, unknown>): Promise<{ jobId: string }>;
}
