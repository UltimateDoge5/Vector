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
    }).catch(e => console.log(e));;

    await db.insert(Teacher).values(
        {
            userId: newRegisteredUser.id,
            name: `${firstName} ${lastName}`
        }
    ).catch(e => console.log(e));

    const newCreatedTeacher = await db.select(
        {
            id: Teacher.id,
            userId: Teacher.userId,
            name: Teacher.name,
            admin: Teacher.admin
        })
        .from(Teacher)
        .where(eq(Teacher.userId, newRegisteredUser.id))
        .limit(1)
        .catch(e => console.log(e));

    return NextResponse.json({ ...newCreatedTeacher[0], password: defaultUserPassword } );
}

export async function PUT(request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { userId, firstName, lastName } : { userId: string, firstName: string, lastName: string} = await request.json();

    await clerkClient.users.updateUser(userId, { firstName, lastName}).catch(e => console.log(e));

    await db.update(Teacher)
        .set({name: `${firstName} ${lastName}`})
        .where(eq(Teacher.userId, userId))
        .catch(e => console.log(e));

    return new NextResponse();
}

export async function DELETE(request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { userId } : { userId: string } = await request.json();

    await clerkClient.users.deleteUser(userId).catch(e => console.log(e));

    await db.delete(Teacher).where(eq(Teacher.userId, userId)).catch(e => console.log(e));

    return new NextResponse();
}