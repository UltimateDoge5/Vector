import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { Class, Teacher } from "~/server/db/schema";

export async function POST(request: Request) {
	const { classId, teacherId } = (await request.json()) as { classId: number; teacherId: number };

	const oldTeacher = await db.query.Class.findFirst({ where: (classObject) => eq(classObject.id, classId) });

	await db.update(Class).set({ teacherId }).where(eq(Class.id, classId));
	await db.update(Teacher).set({ classId }).where(eq(Teacher.id, teacherId));
	await db.update(Teacher).set({ classId: null }).where(eq(Teacher.id, oldTeacher!.teacherId));

	return new NextResponse(null, { status: 201 });
}
