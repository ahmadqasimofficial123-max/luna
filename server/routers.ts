import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addComment, createPost, createReport, createStory, followUser, getFeed, getProfile, getSettings, listMessages, listNotifications, listStories, reactToStory, toggleBlock, toggleLike, toggleMute, toggleSave, updateProfile, updateSettings } from "./db";
import { storagePut } from "./storage";

const mediaSchema = z.object({ url: z.string().min(1), mediaType: z.enum(["image", "video"]), width: z.number().optional(), height: z.number().optional() });
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
    settings: protectedProcedure.query(({ ctx }) => getSettings(ctx.user.id)),
    updateSettings: protectedProcedure.input(z.object({ discoverable: z.boolean().optional(), allowMessages: z.enum(["everyone", "followers", "none"]).optional(), emailNotifications: z.boolean().optional(), pushNotifications: z.boolean().optional(), theme: z.enum(["dark", "light", "system"]).optional(), twoFactorEnabled: z.boolean().optional() })).mutation(({ ctx, input }) => updateSettings(ctx.user.id, input)),
    messages: protectedProcedure.query(({ ctx }) => listMessages(ctx.user.id)),
    updateProfile: protectedProcedure.input(z.object({ username: z.string().min(3).max(40).optional(), displayName: z.string().max(120).optional(), bio: z.string().max(500).optional(), website: z.string().url().or(z.literal("")).optional(), avatarUrl: z.string().url().optional(), isPrivate: z.boolean().optional() })).mutation(({ ctx, input }) => updateProfile(ctx.user.id, input)),
    createPost: protectedProcedure.input(z.object({ caption: z.string().max(2200).optional(), location: z.string().max(180).optional(), audience: z.enum(["public", "followers", "private"]).default("public"), commentsEnabled: z.boolean().default(true), media: z.array(mediaSchema).min(1).max(10) })).mutation(({ ctx, input }) => createPost(ctx.user.id, input)),
    like: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleLike(ctx.user.id, input.postId)),
    save: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleSave(ctx.user.id, input.postId)),
    comment: protectedProcedure.input(z.object({ postId: z.number().int().positive(), body: z.string().min(1).max(1000), parentId: z.number().int().positive().optional() })).mutation(({ ctx, input }) => addComment(ctx.user.id, input.postId, input.body, input.parentId)),
    follow: protectedProcedure.input(z.object({ userId: z.number().int().positive(), isPrivate: z.boolean() })).mutation(({ ctx, input }) => followUser(ctx.user.id, input.userId, input.isPrivate)),
    block: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleBlock(ctx.user.id, input.userId)),
    mute: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleMute(ctx.user.id, input.userId)),
    report: protectedProcedure.input(z.object({ postId: z.number().int().positive().optional(), commentId: z.number().int().positive().optional(), reportedUserId: z.number().int().positive().optional(), reason: z.string().min(2).max(120), details: z.string().max(1000).optional() })).mutation(({ ctx, input }) => createReport(ctx.user.id, input)),
    createStory: protectedProcedure.input(z.object({ mediaUrl: z.string().min(1), mediaType: z.enum(["image", "video"]), caption: z.string().max(180).optional() })).mutation(({ ctx, input }) => createStory(ctx.user.id, input.mediaUrl, input.mediaType, input.caption)),
    reactStory: protectedProcedure.input(z.object({ storyId: z.number().int().positive(), reaction: z.string().min(1).max(16) })).mutation(({ ctx, input }) => reactToStory(ctx.user.id, input.storyId, input.reaction)),
  }),
});
export type AppRouter = typeof appRouter;
