import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { Class, Teacher} from '~/server/db/schema';

export async function POST(request: Request) {
    const {className, teacherId} = (await request.json()) as {className: string, teacherId: number};

    await db.insert(Class).values(
        {
            teacherId: teacherId,
            name: className
        }
    );

    const newCreatedClass = await db.select(
        {
            id: Class.id,
            teacherId: Class.teacherId
        })
        .from(Class)
        .where(eq(Class.teacherId, teacherId))
        .limit(1)

    await db.update(Teacher).set({ classId: newCreatedClass[0]?.id}).where(eq(Teacher.id, teacherId))

    return new NextResponse(null, {status:201})
}   