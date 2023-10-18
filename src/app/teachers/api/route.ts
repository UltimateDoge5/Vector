import { clerkClient } from '@clerk/nextjs';
import { type User } from '@clerk/nextjs/dist/types/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { UserType } from '~/enums/UserType';
import { db } from '~/server/db';
import { Teacher } from '~/server/db/schema';

export async function POST(request: Request) {
     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { firstName, lastName, email } : {firstName: string, lastName: string, email: string} = await request.json();
    const defaultUserPassword = `${firstName}_${lastName}_${Math.floor(Math.random() * 10000)}`;

    const newRegisteredUser = await clerkClient.users.createUser({
        firstName,
        lastName,
        emailAddress: [email],
        password: defaultUserPassword,
        privateMetadata: {
            role: UserType.TEACHER
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

    await clerkClient.users.updateUser(userId, 
        { 
            firstName, 
            lastName,
        }).catch(e => console.log(e));

    await db.update(Teacher)
        .set({name: `${firstName} ${lastName}`})
        .where(eq(Teacher.userId, userId))
        .catch(e => console.log(e));

    return new NextResponse();
}

export async function PATCH(request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { userId, admin} : { userId: string, admin: boolean } = await request.json();

    await clerkClient.users.updateUser(userId, 
        { 
            privateMetadata: {
                role: admin ? UserType.ADMIN : UserType.TEACHER
            }
        }).catch(e => console.log(e));

    await db.update(Teacher)
        .set({admin})
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