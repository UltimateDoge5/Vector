import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { LessonGroup } from "~/server/db/schema";

export async function POST(req: NextRequest) {
	const body = (await req.json()) as unknown;
	let error = false;

	const schema = z.object({
        classId: z.number(),
		teacherId: z.number(),
        lessonId: z.number()
	});

	const parsedData = schema.safeParse(body);

	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), {
			status: 400,
		});
	}

	const data = parsedData.data;

	await db.insert(LessonGroup).values({
        classId: data.classId,
        teacherId: data.teacherId,
        lessonId: data.lessonId
    }).catch(() => error = true);

    const newLesssonGroup = await db.query.LessonGroup.findFirst({
        with: { teacher: {}, lesson: {}, class: {}},
        where: (lessonGroup, { eq, and }) => and(eq(lessonGroup.classId, data.classId), eq(lessonGroup.teacherId, data.teacherId), eq(lessonGroup.lessonId, data.lessonId)),
    }).catch(() => error = true);
	

	if(error) return new NextResponse(null, { status: 500 });

	return NextResponse.json(newLesssonGroup, { status: 201});
}

export async function PUT(req: NextRequest) {
	const body = (await req.json()) as unknown;
	let error = false;

	const schema = z.object({
		id: z.number(),
		teacherId: z.number(),
        lessonId: z.number()
	});

	const parsedData = schema.safeParse(body);

	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), {
			status: 400,
		});
	}

    const data = parsedData.data;

    await db.update(LessonGroup)
        .set({ teacherId: data.teacherId, lessonId: data.lessonId })
        .where(eq(LessonGroup.id, data.id))
		.catch(() => error = true);


	if(error) return new NextResponse(null, { status: 500 });
	
	return new NextResponse();
}

export async function DELETE(req: NextRequest) {
	const body = (await req.json()) as unknown;
	let error = false;

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

    await db.delete(LessonGroup)
        .where(eq(LessonGroup.id, data.id))
		.catch(() => error = true);


	if(error) return new NextResponse(null, { status: 500 });

	return new NextResponse();
}