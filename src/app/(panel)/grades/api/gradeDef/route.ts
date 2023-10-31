import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { GradeDefinition } from "~/server/db/schema";

export const POST = async (req: NextRequest) => {
	const body = (await req.json()) as unknown;

	const schema = z.object({
		name: z.string().min(3),
		lessonGroupId: z.number().int().positive(),
		weight: z.number().int().positive(),
	});

	const parsedData = schema.safeParse(body);
	if (!parsedData.success) return new NextResponse(JSON.stringify(parsedData.error), { status: 400 });

	const data = parsedData.data;

	const result = await db.insert(GradeDefinition).values(data);
	return new NextResponse(JSON.stringify({ id: result.insertId }), { status: 201 });
};
