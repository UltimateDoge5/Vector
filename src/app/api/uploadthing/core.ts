import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs";
import { isStudent } from "~/util/authUtil";
import { z } from "zod";
import { db } from "~/server/db";
import { Submission } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const f = createUploadthing();

export const vectorFileRouter = {
	attachment: f([
		"pdf",
		"text",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-powerpoint",
		"application/zip",
		"image",
		"video",
	])
		.input(
			z.object({
				submissionId: z.number(),
			}),
		)
		.middleware(async ({ input }) => {
			const user = await currentUser();
			if (!user || !isStudent(user)) throw new Error("Unauthorized");

			return { userId: user.id, submissionId: input.submissionId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			await db
				.update(Submission)
				.set({
					attachment: file.key,
				})
				.where(eq(Submission.id, metadata.submissionId));
		}),
} satisfies FileRouter;

export type VectorFileRouter = typeof vectorFileRouter;
