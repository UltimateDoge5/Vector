import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Submission } from "~/server/db/schema";

export async function POST(req: NextRequest) {
	const body = await req.json() as unknown;

	const schema = z.object({
		assignmentId: z.number(),
		studentId: z.number(),
		content: z.string(),
	});

	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

	const res = await db.insert(Submission).values({
		...parsed.data,
		attachment: null,
	});

	return NextResponse.json({ id: res.insertId }, { status: 201 });
}