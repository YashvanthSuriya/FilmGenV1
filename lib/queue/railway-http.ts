import { JobQueue } from "./types";

export const railwayQueue: JobQueue = {
  async enqueue(jobType, payload) {
    // STUB: Will POST to Railway /enqueue with X-Worker-Secret
    console.log("[STUB] Railway enqueue", { jobType, payload });
    return { jobId: `stub-job-${Date.now()}` };
  },
};
