import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Lesson } from "~/server/db/schema";

export async function POST(req: NextRequest) {
	const body = (await req.json()) as unknown;

	const schema = z.object({
		name: z.string()
	});

	const parsedData = schema.safeParse(body);

	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), {
			status: 400,
		});
	}

	const data = parsedData.data;

	await db.insert(Lesson).values({
        name: data.name
    })

    const newLessson = await db.query.Lesson.findFirst({
        where: (lesson, { eq }) => eq(lesson.name, data.name),
        columns: {
            id: true, 
            name: true
        }
    })

	return NextResponse.json(newLessson, { status: 201});
}

export async function PUT(req: NextRequest) {
	const body = (await req.json()) as unknown;

	const schema = z.object({
        id: z.number(),
		name: z.string()
	});

	const parsedData = schema.safeParse(body);

	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), {
			status: 400,
		});
	}

    const data = parsedData.data;

    await db.update(Lesson)
        .set({name: data.name})
        .where(eq(Lesson.id, data.id));

	return new NextResponse();
}

export async function DELETE(req: NextRequest) {
	const body = (await req.json()) as unknown;

	const schema = z.object({
        id: z.number(),
	});

	const parsedData = schema.safeParse(body);

	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), {
			status: 400,
		});
	}

    const data = parsedData.data;

    await db.delete(Lesson)
        .where(eq(Lesson.id, data.id));

	return new NextResponse();
}

