import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addComment, createPost, createReport, createStory, findOrCreateDirectConversation, followUser, getFeed, getProfile, getSettings, hideNotification, hidePost, listConversationInbox, searchMembers, listMessages, listNotifications, markMessagesRead, reactToMessage, listReports, listStories, markNotificationRead, muteNotificationType, recordNotificationAction, reactToStory, replyToStory, sendMessage, sharePost, toggleBlock, toggleLike, toggleMute, toggleSave, updateFollowStatus, updateProfile, updateSettings, searchAdminUsers, listMembersWithRoles, promoteSelectedUser, getAppSettings, updateAppSettings } from "./db";
import { storagePut } from "./storage";

const mediaSchema = z.object({ url: z.string().min(1), mediaType: z.enum(["image", "video"]), width: z.number().optional(), height: z.number().optional() });
const avatarUrlSchema = z.string().min(1).refine(value => value.startsWith("/manus-storage/") || /^https?:\/\//i.test(value), "Avatar URL must be an http(s) or Manus storage URL");
const appNameSchema = z.string().trim().min(1).max(80);
const taglineSchema = z.string().trim().min(1).max(180);
const accentColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i, "Accent color must be a 6-digit hex color");
const adminProcedure = protectedProcedure.use(({ ctx, next }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" }); return next(); });
export const appRouter = router({
  system: systemRouter,
  media: router({
    upload: protectedProcedure.input(z.object({ filename: z.string().min(1).max(180), contentType: z.string().min(1).max(120), data: z.string().min(1).max(8_000_000) })).mutation(async ({ ctx, input }) => {
      const bytes = Buffer.from(input.data, "base64");
      return storagePut(`${ctx.user.id}/uploads/${input.filename}`, bytes, input.contentType);
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  social: router({
    feed: publicProcedure.input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional()).query(({ input }) => getFeed(input?.limit ?? 20)),
    stories: publicProcedure.query(() => listStories()),
    profile: publicProcedure.input(z.object({ userId: z.number().int().positive() })).query(({ input }) => getProfile(input.userId)),
    notifications: protectedProcedure.query(({ ctx }) => listNotifications(ctx.user.id)),
    markNotificationRead: protectedProcedure.input(z.object({ notificationId: z.number().int().positive() })).mutation(({ ctx, input }) => markNotificationRead(ctx.user.id, input.notificationId)),
    recordNotificationAction: protectedProcedure.input(z.object({ notificationId: z.number().int().positive(), action: z.enum(["approve", "decline", "cancel", "mute", "hide", "read", "report"]) })).mutation(({ ctx, input }) => recordNotificationAction(ctx.user.id, input.notificationId, input.action)),
    hideNotification: protectedProcedure.input(z.object({ notificationId: z.number().int().positive() })).mutation(({ ctx, input }) => hideNotification(ctx.user.id, input.notificationId)),
    muteNotification: protectedProcedure.input(z.object({ notificationType: z.string().min(1).max(32) })).mutation(({ ctx, input }) => muteNotificationType(ctx.user.id, input.notificationType)),
    updateFollowStatus: protectedProcedure.input(z.object({ actorId: z.number().int().positive(), status: z.enum(["accepted", "declined", "cancelled"]) })).mutation(({ ctx, input }) => updateFollowStatus(ctx.user.id, input.actorId, input.status)),
    reports: protectedProcedure.query(() => listReports()),
    settings: protectedProcedure.query(({ ctx }) => getSettings(ctx.user.id)),
    appSettings: publicProcedure.query(() => getAppSettings()),
    updateAppSettings: adminProcedure.input(z.object({ appName: appNameSchema.optional(), tagline: taglineSchema.optional(), theme: z.enum(["dark", "light", "system"]).optional(), accentColor: accentColorSchema.optional() }).refine(input => Object.keys(input).length > 0, "At least one app setting is required")).mutation(({ ctx, input }) => updateAppSettings(ctx.user.id, input)),
    updateSettings: protectedProcedure.input(z.object({ discoverable: z.boolean().optional(), allowMessages: z.enum(["everyone", "followers", "none"]).optional(), emailNotifications: z.boolean().optional(), pushNotifications: z.boolean().optional(), theme: z.enum(["dark", "light", "system"]).optional(), twoFactorEnabled: z.boolean().optional() })).mutation(({ ctx, input }) => updateSettings(ctx.user.id, input)),
    inbox: protectedProcedure.query(({ ctx }) => listConversationInbox(ctx.user.id)),
    memberSearch: protectedProcedure.input(z.object({ query: z.string().min(2).max(80) })).query(({ ctx, input }) => searchMembers(ctx.user.id, input.query)),
    openDirectConversation: protectedProcedure.input(z.object({ memberId: z.number().int().positive() })).mutation(({ ctx, input }) => findOrCreateDirectConversation(ctx.user.id, input.memberId)),
    messages: protectedProcedure.input(z.object({ conversationId: z.number().int().positive().optional() }).optional()).query(({ ctx, input }) => listMessages(ctx.user.id, input?.conversationId)),
    sendMessage: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), body: z.string().max(2000), attachmentUrl: z.string().url().optional(), attachmentType: z.enum(["image", "video", "voice"]).optional() }).refine(input => input.body.trim().length > 0 || input.attachmentUrl, "Message text or an attachment is required")).mutation(({ ctx, input }) => sendMessage(ctx.user.id, input.conversationId, input.body, input.attachmentUrl, input.attachmentType)),
    reactToMessage: protectedProcedure.input(z.object({ messageId: z.number().int().positive(), reaction: z.string().max(16) })).mutation(({ ctx, input }) => reactToMessage(ctx.user.id, input.messageId, input.reaction)),
    markMessagesRead: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).mutation(({ ctx, input }) => markMessagesRead(ctx.user.id, input.conversationId)),
    updateProfile: protectedProcedure.input(z.object({ username: z.string().min(3).max(40).optional(), displayName: z.string().max(120).optional(), bio: z.string().max(500).optional(), website: z.string().url().or(z.literal("")).optional(), avatarUrl: avatarUrlSchema.optional(), isPrivate: z.boolean().optional() })).mutation(({ ctx, input }) => updateProfile(ctx.user.id, input)),
    createPost: protectedProcedure.input(z.object({ caption: z.string().max(2200).optional(), location: z.string().max(180).optional(), hashtags: z.string().max(1000).optional(), mentions: z.string().max(1000).optional(), audience: z.enum(["public", "followers", "private"]).default("public"), commentsEnabled: z.boolean().default(true), media: z.array(mediaSchema).min(1).max(10) })).mutation(({ ctx, input }) => createPost(ctx.user.id, input)),
    like: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleLike(ctx.user.id, input.postId)),
    save: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleSave(ctx.user.id, input.postId)),
    comment: protectedProcedure.input(z.object({ postId: z.number().int().positive(), body: z.string().min(1).max(1000), parentId: z.number().int().positive().optional() })).mutation(({ ctx, input }) => addComment(ctx.user.id, input.postId, input.body, input.parentId)),
    follow: protectedProcedure.input(z.object({ userId: z.number().int().positive(), isPrivate: z.boolean() })).mutation(({ ctx, input }) => followUser(ctx.user.id, input.userId, input.isPrivate)),
    block: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleBlock(ctx.user.id, input.userId)),
    mute: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleMute(ctx.user.id, input.userId)),
    share: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(({ ctx, input }) => sharePost(ctx.user.id, input.postId)),
    hide: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(({ ctx, input }) => hidePost(ctx.user.id, input.postId)),
    report: protectedProcedure.input(z.object({ postId: z.number().int().positive().optional(), commentId: z.number().int().positive().optional(), reportedUserId: z.number().int().positive().optional(), reason: z.string().min(2).max(120), details: z.string().max(1000).optional() })).mutation(({ ctx, input }) => createReport(ctx.user.id, input)),
    createStory: protectedProcedure.input(z.object({ mediaUrl: z.string().url(), mediaType: z.enum(["image", "video"]), caption: z.string().max(180).optional() })).mutation(({ ctx, input }) => createStory(ctx.user.id, input.mediaUrl, input.mediaType, input.caption)),
    reactStory: protectedProcedure.input(z.object({ storyId: z.number().int().positive(), reaction: z.string().min(1).max(16) })).mutation(({ ctx, input }) => reactToStory(ctx.user.id, input.storyId, input.reaction)),
    replyStory: protectedProcedure.input(z.object({ storyId: z.number().int().positive(), body: z.string().min(1).max(500) })).mutation(({ ctx, input }) => replyToStory(ctx.user.id, input.storyId, input.body)),
    memberDirectory: protectedProcedure.input(z.object({ query: z.string().max(80).default("") }).optional()).query(({ input }) => listMembersWithRoles(input?.query || "")),
    adminUsers: adminProcedure.input(z.object({ query: z.string().max(80).default("") })).query(({ input }) => searchAdminUsers(input.query)),
    promoteUser: adminProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(({ ctx, input }) => promoteSelectedUser(ctx.user.id, input.userId)),
    updateMemberRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), role: z.enum(["admin", "user"]) })).mutation(({ ctx, input }) => { if (ctx.user.id === input.userId) throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot change your own role" }); return promoteSelectedUser(ctx.user.id, input.userId, input.role); }),
  }),
});
export type AppRouter = typeof appRouter;
