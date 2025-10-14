import { defineSchema, defineTable } from "../_generated/convex/server";
import { v } from "../convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    displayName: v.string(),
    role: v.union(v.literal("listener"), v.literal("creator"), v.literal("admin")),
    profileImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    socialLinks: v.optional(v.object({ twitter: v.optional(v.string()), youtube: v.optional(v.string()), website: v.optional(v.string()) })),
    badges: v.array(v.string()), // Array of badge IDs
    rewards: v.array(v.string()), // Array of reward IDs
    xp: v.number(),
    level: v.number(),
    lastActive: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  creator_requests: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    bio: v.string(),
    socialLinks: v.object({ twitter: v.optional(v.string()), youtube: v.optional(v.string()), website: v.optional(v.string()) }),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    submittedAt: v.number(),
  }).index("by_userId", ["userId"]),

  podcasts: defineTable({
    title: v.string(),
    description: v.string(),
    author: v.id("users"),
    authorName: v.string(),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    coverImage: v.string(),
    coverImageKey: v.string(),
    episodeCount: v.number(),
    isPublished: v.boolean(),
  }).index("by_author", ["author"])
    .index("by_isPublished", ["isPublished"]),

  episodes: defineTable({
    podcastId: v.id("podcasts"),
    title: v.string(),
    description: v.string(),
    audioUrl: v.string(),
    audioKey: v.string(),
    coverImage: v.string(),
    coverImageKey: v.string(),
    duration: v.number(),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
  }).index("by_podcastId", ["podcastId"])
    .index("by_isPublished", ["isPublished"]),

  audiobooks: defineTable({
    title: v.string(),
    author: v.id("users"),
    authorName: v.string(),
    narrator: v.string(),
    description: v.string(),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    audioUrl: v.string(),
    audioKey: v.string(),
    coverImage: v.string(),
    coverImageKey: v.string(),
    duration: v.number(),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
  }).index("by_author", ["author"])
    .index("by_isPublished", ["isPublished"]),

  playlists: defineTable({
    title: v.string(),
    description: v.string(),
    creator: v.id("users"),
    items: v.array(v.object({
      contentId: v.string(), // Can be episodeId or audiobookId
      contentType: v.union(v.literal("episode"), v.literal("audiobook")),
    })),
    coverImage: v.string(),
    coverImageKey: v.string(),
    isPublic: v.boolean(),
  }).index("by_creator", ["creator"])
    .index("by_isPublic", ["isPublic"]),

  user_progress: defineTable({
    userId: v.string(),
    contentId: v.string(), // episodeId or audiobookId
    contentType: v.union(v.literal("episode"), v.literal("audiobook")),
    progress: v.number(), // current playback position in seconds
    lastListened: v.number(), // timestamp of last listen
  }).index("by_userId", ["userId"])
    .index("by_userId_contentId", ["userId", "contentId"]),

  rewards: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.string(), // e.g., "badge", "currency", "unlock"
    value: v.number(),
    imageUrl: v.optional(v.string()),
  }),

  badges: defineTable({
    name: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    criteria: v.string(), // e.g., "Listen to 10 podcasts", "Publish 5 episodes"
  }),
});