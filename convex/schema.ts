// convex/schema.ts — Single source of truth for all Convex tables
// Generated from DATABASE_SCHEMA.md v1.0 | June 2026

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    plan: v.union(v.literal("basic"), v.literal("pro"), v.literal("director")),
    credits: v.number(),
    monthlyCredits: v.number(),
    paddleSubscriptionId: v.optional(v.string()),
    paddleCustomerId: v.optional(v.string()),
    deletionRequestedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_plan", ["plan"]),

  projects: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    template: v.optional(v.union(
      v.literal("blank"),
      v.literal("short-film"),
      v.literal("music-video"),
      v.literal("documentary"),
      v.literal("youtube-short")
    )),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    aspectRatio: v.optional(v.union(
      v.literal("16:9"), v.literal("9:16"), v.literal("1:1"), v.literal("21:9")
    )),
    totalDurationSeconds: v.optional(v.number()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_updated", ["updatedAt"]),

  styleCards: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    mood: v.optional(v.string()),
    styleIntensity: v.optional(v.number()),
    referenceImageIds: v.array(v.id("_storage")),
    generatedSheetId: v.optional(v.id("_storage")),
    extractedColors: v.optional(v.array(v.string())),
    keywords: v.optional(v.array(v.string())),
    promptTemplate: v.optional(v.string()),
    isMarketplaceListed: v.boolean(),
    price: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_name", ["ownerId", "name"])
    .index("by_marketplace", ["isMarketplaceListed", "price"]),

  storyboardFrames: defineTable({
    ownerId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    name: v.string(),
    description: v.optional(v.string()),
    panelCount: v.number(),
    panelData: v.array(v.object({
      shotNumber: v.string(),
      prompt: v.string(),
      shotType: v.optional(v.string()),
      cameraMovement: v.optional(v.string()),
      aspectRatio: v.optional(v.string()),
      referenceImageId: v.optional(v.id("_storage")),
    })),
    compositeImageId: v.optional(v.id("_storage")),
    extractedPanelIds: v.optional(v.array(v.id("_storage"))),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_owner", ["ownerId"])
    .index("by_owner_project", ["ownerId", "projectId"]),

  actionCards: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    motionType: v.optional(v.union(
      v.literal("static"), v.literal("pan"), v.literal("tilt"), v.literal("dolly"),
      v.literal("truck"), v.literal("crane"), v.literal("handheld"), v.literal("zoom"), v.literal("orbit")
    )),
    direction: v.optional(v.union(
      v.literal("left"), v.literal("right"), v.literal("up"), v.literal("down"),
      v.literal("in"), v.literal("out"), v.literal("clockwise"), v.literal("counterclockwise")
    )),
    speed: v.optional(v.union(v.literal("slow"), v.literal("medium"), v.literal("fast"))),
    intensity: v.optional(v.number()),
    referenceImageIds: v.array(v.id("_storage")),
    motionOverlayImageId: v.optional(v.id("_storage")),
    promptTemplate: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_name", ["ownerId", "name"]),

  characters: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    role: v.union(v.literal("hero"), v.literal("villain"), v.literal("supporting"), v.literal("narrator")),
    description: v.string(),
    referenceImageIds: v.array(v.id("_storage")),
    characterSheetId: v.optional(v.id("_storage")),
    consistencyScore: v.optional(v.number()),
    promptTemplate: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_name", ["ownerId", "name"]),

  generatedMedia: defineTable({
    ownerId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("audio")),
    prompt: v.string(),
    originalPrompt: v.optional(v.string()),
    model: v.string(),
    convexStorageId: v.optional(v.id("_storage")),
    r2Key: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    styleCardId: v.optional(v.id("styleCards")),
    characterIds: v.optional(v.array(v.id("characters"))),
    actionCardId: v.optional(v.id("actionCards")),
    storyboardFrameId: v.optional(v.id("storyboardFrames")),
    creditsUsed: v.number(),
    jobId: v.optional(v.id("generationJobs")),
    status: v.union(v.literal("queued"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    metadata: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      duration: v.optional(v.number()),
      fileSize: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      frameRate: v.optional(v.number()),
    })),
    challengeSubmissionId: v.optional(v.id("challengeSubmissions")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_project", ["projectId"])
    .index("by_job", ["jobId"])
    .index("by_owner_type", ["ownerId", "type"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_challenge", ["challengeSubmissionId"]),

  generationJobs: defineTable({
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    type: v.union(
      v.literal("image"), v.literal("video"), v.literal("script"),
      v.literal("music"), v.literal("voiceover"), v.literal("storyboard"), v.literal("actor-sheet")
    ),
    status: v.union(v.literal("queued"), v.literal("processing"), v.literal("completed"), v.literal("failed"), v.literal("cancelled")),
    prompt: v.string(),
    model: v.string(),
    creditsUsed: v.number(),
    creditsRefunded: v.optional(v.boolean()),
    styleCardId: v.optional(v.id("styleCards")),
    characterIds: v.optional(v.array(v.id("characters"))),
    actionCardId: v.optional(v.id("actionCards")),
    storyboardFrameId: v.optional(v.id("storyboardFrames")),
    resultMediaId: v.optional(v.id("generatedMedia")),
    errorMessage: v.optional(v.string()),
    errorCode: v.optional(v.string()),
    attempts: v.number(),
    maxAttempts: v.number(),
    workerId: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_status", ["status"])
    .index("by_project", ["projectId"])
    .index("by_created", ["createdAt"]),

  creditTransactions: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    action: v.union(
      v.literal("monthly_allocation"), v.literal("topup"), v.literal("generation_deduction"),
      v.literal("generation_refund"), v.literal("challenge_reward"), v.literal("admin_adjustment")
    ),
    jobId: v.optional(v.id("generationJobs")),
    paddleTransactionId: v.optional(v.string()),
    challengeId: v.optional(v.id("challenges")),
    metadata: v.optional(v.object({
      model: v.optional(v.string()),
      promptLength: v.optional(v.number()),
      generationType: v.optional(v.string()),
    })),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_paddle_transaction", ["paddleTransactionId"])
    .index("by_job", ["jobId"])
    .index("by_action", ["action"]),

  studioWorkflows: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    nodes: v.array(v.object({
      id: v.string(),
      type: v.union(
        v.literal("start"), v.literal("card"), v.literal("prompt"), v.literal("referenceMerge"),
        v.literal("camera"), v.literal("generateImage"), v.literal("generateVideo"), v.literal("save"), v.literal("connect")
      ),
      position: v.object({ x: v.number(), y: v.number() }),
      data: v.optional(v.object({
        cardId: v.optional(v.string()),
        cardType: v.optional(v.string()),
        prompt: v.optional(v.string()),
        model: v.optional(v.string()),
        duration: v.optional(v.number()),
        shotType: v.optional(v.string()),
        cameraMovement: v.optional(v.string()),
      })),
    })),
    edges: v.array(v.object({
      id: v.string(),
      source: v.string(),
      target: v.string(),
      sourceHandle: v.optional(v.string()),
      targetHandle: v.optional(v.string()),
    })),
    lastRunAt: v.optional(v.number()),
    lastRunStatus: v.optional(v.union(v.literal("success"), v.literal("partial"), v.literal("failed"))),
    totalRuns: v.number(),
    isMarketplaceListed: v.boolean(),
    price: v.optional(v.number()),
    rating: v.optional(v.number()),
    salesCount: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_name", ["ownerId", "name"])
    .index("by_marketplace", ["isMarketplaceListed", "price"]),

  editorTimelines: defineTable({
    projectId: v.id("projects"),
    ownerId: v.id("users"),
    tracks: v.array(v.object({
      id: v.string(),
      type: v.union(v.literal("video"), v.literal("audio")),
      label: v.string(),
      clips: v.array(v.object({
        id: v.string(),
        trackId: v.string(),
        sourceId: v.string(),
        sourceType: v.union(v.literal("generation"), v.literal("sfx"), v.literal("score"), v.literal("upload")),
        startTime: v.number(),
        endTime: v.number(),
        trimStart: v.number(),
        trimEnd: v.number(),
        volume: v.number(),
        fadeIn: v.number(),
        fadeOut: v.number(),
        transitionIn: v.optional(v.union(v.literal("cut"), v.literal("dissolve"), v.literal("fade_black"))),
        colorGrade: v.optional(v.object({
          lutPreset: v.optional(v.union(
            v.literal("cinematic"), v.literal("noir"), v.literal("warm"), v.literal("cool"), v.literal("vintage"), v.literal("clean")
          )),
          lutStrength: v.optional(v.number()),
          exposure: v.optional(v.number()),
          contrast: v.optional(v.number()),
          saturation: v.optional(v.number()),
          temperature: v.optional(v.number()),
          tint: v.optional(v.number()),
        })),
      })),
    })),
    projectColorGrade: v.optional(v.object({
      lutPreset: v.optional(v.union(
        v.literal("cinematic"), v.literal("noir"), v.literal("warm"), v.literal("cool"), v.literal("vintage"), v.literal("clean")
      )),
      lutStrength: v.optional(v.number()),
      exposure: v.optional(v.number()),
      contrast: v.optional(v.number()),
      saturation: v.optional(v.number()),
      temperature: v.optional(v.number()),
      tint: v.optional(v.number()),
    })),
    durationSeconds: v.number(),
    updatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_owner", ["ownerId"]),

  audioMixSettings: defineTable({
    timelineId: v.id("editorTimelines"),
    ownerId: v.id("users"),
    trackId: v.string(),
    eq: v.optional(v.object({
      lowGain: v.number(),
      midGain: v.number(),
      highGain: v.number(),
      lowFreq: v.number(),
      highFreq: v.number(),
    })),
    reverb: v.optional(v.object({
      roomSize: v.number(),
      wet: v.number(),
    })),
    automation: v.array(v.object({
      timeSeconds: v.number(),
      volume: v.number(),
    })),
    updatedAt: v.number(),
  })
    .index("by_timeline", ["timelineId"])
    .index("by_owner", ["ownerId"]),

  gradeCards: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    grade: v.object({
      lutPreset: v.optional(v.union(
        v.literal("cinematic"), v.literal("noir"), v.literal("warm"), v.literal("cool"), v.literal("vintage"), v.literal("clean")
      )),
      lutStrength: v.optional(v.number()),
      exposure: v.optional(v.number()),
      contrast: v.optional(v.number()),
      saturation: v.optional(v.number()),
      temperature: v.optional(v.number()),
      tint: v.optional(v.number()),
    }),
    isMarketplaceListed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_name", ["ownerId", "name"]),

  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    theme: v.string(),
    rules: v.string(),
    prizePool: v.number(),
    entryFee: v.number(),
    status: v.union(v.literal("upcoming"), v.literal("open"), v.literal("voting"), v.literal("judging"), v.literal("closed")),
    submissionStart: v.number(),
    submissionEnd: v.number(),
    votingEnd: v.number(),
    judgingEnd: v.number(),
    winnerId: v.optional(v.id("users")),
    winnerSubmissionId: v.optional(v.id("challengeSubmissions")),
    featuredProjectId: v.optional(v.id("projects")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_dates", ["submissionStart", "submissionEnd"]),

  challengeSubmissions: defineTable({
    challengeId: v.id("challenges"),
    userId: v.id("users"),
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    videoR2Key: v.optional(v.string()),
    voteCount: v.number(),
    juryScore: v.optional(v.number()),
    status: v.union(v.literal("submitted"), v.literal("shortlisted"), v.literal("winner"), v.literal("disqualified")),
    submittedAt: v.number(),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_challenge_votes", ["challengeId", "voteCount"])
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"]),

  challengeVotes: defineTable({
    challengeId: v.id("challenges"),
    submissionId: v.id("challengeSubmissions"),
    userId: v.id("users"),
    votedAt: v.number(),
  })
    .index("by_challenge_submission", ["challengeId", "submissionId"])
    .index("by_user_challenge", ["userId", "challengeId"])
    .index("by_submission", ["submissionId"]),

  webhookEvents: defineTable({
    eventId: v.string(),
    provider: v.union(v.literal("paddle"), v.literal("clerk")),
    eventType: v.string(),
    processedAt: v.number(),
    status: v.union(v.literal("processed"), v.literal("failed"), v.literal("ignored")),
    errorMessage: v.optional(v.string()),
  })
    .index("by_event_id", ["eventId"])
    .index("by_provider_event", ["provider", "eventId"]),

  deletionRequests: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    email: v.string(),
    requestedAt: v.number(),
    scheduledAt: v.number(),
    completedAt: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed")),
  })
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledAt"])
    .index("by_user", ["userId"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.object({
      ip: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      details: v.optional(v.string()),
    })),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_action", ["action"]),
});
