import { ObjectId } from "mongodb";
import { getCollection } from "../db.js";

const DEFAULT_MAX_ATTEMPTS = 5;
const STALE_LOCK_MS = 5 * 60 * 1000;

export const JOB_TYPES = {
  FULL_SYNC: "FULL_SYNC",
  ORDER_CREATED: "ORDER_CREATED",
  LAST_24H_SYNC: "LAST_24H_SYNC",
};

function nextRetryRunAt(attempts) {
  const backoffMs = Math.min(1000 * 2 ** attempts, 5 * 60 * 1000);
  return new Date(Date.now() + backoffMs);
}

export async function enqueueJob({
  shop,
  type,
  payload = {},
  runAt = new Date(),
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}) {
  const queue = await getCollection("queue_jobs");

  await queue.insertOne({
    shop,
    type,
    payload,
    status: "pending",
    attempts: 0,
    maxAttempts,
    runAt,
    lockedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    error: null,
  });
}

export async function enqueueUniqueJob(shop, type, payload = {}) {
  const queue = await getCollection("queue_jobs");
  const existing = await queue.findOne({
    shop,
    type,
    status: { $in: ["pending", "running"] },
  });

  if (existing) {
    return;
  }

  await enqueueJob({ shop, type, payload });
}

export async function claimNextJob() {
  const queue = await getCollection("queue_jobs");
  const staleThreshold = new Date(Date.now() - STALE_LOCK_MS);

  const result = await queue.findOneAndUpdate(
    {
      $or: [
        { status: "pending", runAt: { $lte: new Date() } },
        { status: "running", lockedAt: { $lte: staleThreshold } },
      ],
    },
    {
      $set: {
        status: "running",
        lockedAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { sort: { runAt: 1, createdAt: 1 }, returnDocument: "after" }
  );

  return result;
}

export async function completeJob(jobId) {
  const queue = await getCollection("queue_jobs");
  await queue.updateOne(
    { _id: new ObjectId(jobId) },
    {
      $set: {
        status: "completed",
        lockedAt: null,
        updatedAt: new Date(),
        completedAt: new Date(),
      },
    }
  );
}

export async function failJob(job, error) {
  const queue = await getCollection("queue_jobs");
  const attempts = (job.attempts || 0) + 1;
  const maxAttempts = job.maxAttempts || DEFAULT_MAX_ATTEMPTS;
  const shouldRetry = attempts < maxAttempts;

  await queue.updateOne(
    { _id: job._id },
    {
      $set: {
        status: shouldRetry ? "pending" : "failed",
        attempts,
        runAt: shouldRetry ? nextRetryRunAt(attempts) : job.runAt,
        lockedAt: null,
        updatedAt: new Date(),
        error: String(error?.message || error || "Unknown error"),
      },
    }
  );
}
