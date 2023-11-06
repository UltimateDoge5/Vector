/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs";
import { isStudent } from "~/util/authUtil";
import { z } from "zod";
import { db } from "~/server/db";
import { Submission } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { lookup } from "@uploadthing/mime-types";

const f = createUploadthing();

export const vectorFileRouter = {
	attachment: f([
		"pdf",
		"text",
		// We know these are valid file types, and it won't fail, and there is no other way to assert the correct type
		// @ts-ignore
		lookup("docx"),
		// @ts-ignore
		lookup("pptx"),
		// @ts-ignore
		lookup("xlsx"),
		// @ts-ignore
		lookup("doc"),
		// @ts-ignore
		lookup("ppt"),
		// @ts-ignore
		lookup("xls"),
		"image",
		"video",
	])
		.middleware(async () => {
			const user = await currentUser();
			if (!user || !isStudent(user)) throw new Error("Unauthorized");

			return { userId: user.id };
		})
		.onUploadComplete(() => console.log("File upload successful")),
} satisfies FileRouter;

export type VectorFileRouter = typeof vectorFileRouter;
