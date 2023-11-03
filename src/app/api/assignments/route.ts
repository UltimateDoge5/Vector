import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Assignment, Submission } from "~/server/db/schema";
import { isTeacher } from "~/util/authUtil";
import { currentUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
	const user = await currentUser();
	if (!isTeacher(user)) return NextResponse.json(null, { status: 403 });

	const body = (await req.json()) as unknown;

	const schema = z.object({
		classId: z.number(),
		teacherId: z.number(),
		name: z.string(),
		dueDate: z.coerce.date(),
		description: z.string().nullable(),
		allowLate: z.boolean(),
		fileRequired: z.boolean(),
	});

	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

	const result = await db.insert(Assignment).values({
		...parsed.data,
	});

	return NextResponse.json({ id: result.insertId }, { status: 200 });
}

export async function PUT(req: NextRequest) {
	const user = await currentUser();
	if (!isTeacher(user)) return NextResponse.json(null, { status: 403 });

	const body = (await req.json()) as unknown;

	const schema = z.object({
		id: z.number(),
		name: z.string().optional(),
		dueDate: z.coerce.date().optional(),
		description: z.string().optional(),
		allowLate: z.boolean().optional(),
		fileRequired: z.boolean().optional(),
	});

	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

	await db
		.update(Assignment)
		.set({
			...parsed.data,
		})
		.where(eq(Assignment.id, parsed.data.id));

	return NextResponse.json(null, { status: 200 });
}

export async function DELETE(req: NextRequest) {
	const user = await currentUser();
	if (!isTeacher(user)) return NextResponse.json(null, { status: 403 });

	const body = (await req.json()) as unknown;

	const schema = z.object({
		id: z.number(),
	});

	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

	await db.transaction(async (tx) => {
		await tx.delete(Assignment).where(eq(Assignment.id, parsed.data.id));
		await tx.delete(Submission).where(eq(Submission.assignmentId, parsed.data.id));
	});

	return NextResponse.json(null, { status: 200 });
}
