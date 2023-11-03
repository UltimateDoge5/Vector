import { eq, and } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Grade } from "~/server/db/schema";

export const PUT = async (req: NextRequest) => {
	const body = (await req.json()) as unknown;

	const schema = z.array(
		z.object({
			type: z.enum(["insert", "update", "delete"]),
			value: z.number().optional(),
			studentId: z.number(),
			definitionId: z.number(),
			description: z.string().nullable(),
		}),
	);

	const parsed = schema.safeParse(body);
	if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

	await Promise.allSettled(
		parsed.data.map(async (grade) => {
			switch (grade.type) {
				case "insert":
					await db.insert(Grade).values({
						grade: grade.value!,
						studentId: grade.studentId,
						definitionId: grade.definitionId,
						description: grade.description,
						timestamp: new Date(),
					});
					break;
				case "update":
					await db
						.update(Grade)
						.set({
							description: grade.description,
							grade: grade.value,
						})
						.where(and(eq(Grade.studentId, grade.studentId), eq(Grade.definitionId, grade.definitionId)));
					break;
				case "delete":
					await db.delete(Grade).where(and(eq(Grade.studentId, grade.studentId), eq(Grade.definitionId, grade.definitionId)));
					break;
			}
		}),
	);

	return new NextResponse(null, { status: 200 });
};
