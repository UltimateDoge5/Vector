import { type NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { isTeacher } from "~/util/authUtil";
import { db } from "~/server/db";
import { Submission } from "~/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
	// const user = await currentUser();
	// if (!isTeacher(user)) return new Response(null, { status: 403 })

	const body = await req.json() as unknown;

	const schema = z.object({
		submissionId: z.number(),
		graded: z.boolean()
	})

	const parsedData = schema.safeParse(body)
	if (!parsedData.success) return NextResponse.json(parsedData.error, { status: 400 })

	await db.update(Submission).set({ graded:parsedData.data.graded }).where(eq(Submission.id, parsedData.data.submissionId))
	return new NextResponse(null, { status: 200 })
}