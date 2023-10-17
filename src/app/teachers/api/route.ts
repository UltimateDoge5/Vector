import { clerkClient } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { Teacher } from '~/server/db/schema';

export async function POST(request: Request) {
    // todo: do small poprawki z any here :)
    const { firstName, lastName, email } : any = await request.json();
    const defaultUserPassword = `${firstName}_${lastName}_${Math.floor(Math.random() * 10000)}`;

    const newRegisteredUser = await clerkClient.users.createUser({
        firstName,
        lastName,
        emailAddress: [email],
        password: defaultUserPassword,
        privateMetadata: {
            role: "teacher"
        }
    });

    await db.insert(Teacher).values(
        {
            userId: newRegisteredUser.id,
            name: `${firstName} ${lastName}`
        }
    );

    const newCreatedTeacher = await db.select(
        {
            id: Teacher.id,
            userId: Teacher.userId,
            name: Teacher.name,
            admin: Teacher.admin
        })
        .from(Teacher)
        .where(eq(Teacher.userId, newRegisteredUser.id))
        .limit(1);

    return NextResponse.json({ ...newCreatedTeacher[0], password: defaultUserPassword } );
}