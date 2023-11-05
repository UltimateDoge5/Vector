import { clerkClient } from '@clerk/nextjs';
import { type User } from '@clerk/nextjs/dist/types/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { UserType } from '~/enums/UserType';
import { db } from '~/server/db';
import { Class, Student } from '~/server/db/schema';
import { type StudentWithClassDto } from '~/types/dtos';
import { generateDefaultPassword } from '~/util/authUtil';

export async function POST(request: Request) {
     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { firstName, lastName, email, classId } : {firstName: string, lastName: string, email: string, classId: number} = await request.json();
    const defaultUserPassword = generateDefaultPassword(firstName, lastName);
    let error = false;

    const newRegisteredUser : User = await clerkClient.users.createUser({
        firstName,
        lastName,
        emailAddress: [email],
        password: defaultUserPassword,
        privateMetadata: {
            role: UserType.STUDENT
        }
    }).catch(() => error = true) as User;

    if(error) return new NextResponse(null, { status: 500 });

    await db.insert(Student).values(
        {
            userId: newRegisteredUser?.id,
            name: `${firstName} ${lastName}`,
            classId,
        }
    ).catch(() => error = true);

    const newCreatedStudent: StudentWithClassDto[] = await db.select(
        {
            id: Student.id,
            userId: Student.userId,
            name: Student.name,
            class: {
                id: Class.id,
                name: Class.name
            }
        })
        .from(Student)
        .innerJoin(Class, eq(Student.classId, Class.id))
        .where(eq(Student.userId, newRegisteredUser.id))
        .limit(1)
        .catch(() => error = true) as StudentWithClassDto[];

    if(error) return new NextResponse(null, { status: 500 });

    return NextResponse.json({ ...newCreatedStudent[0], password: defaultUserPassword });
}

export async function PUT(request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { userId, firstName, lastName, classId } : { userId: string, firstName: string, lastName: string, classId: number } = await request.json();
    let error = false;

    await clerkClient.users.updateUser(userId, 
    { 
            firstName, 
            lastName,
        }).catch(() => error = true);

    await db.update(Student)
        .set({name: `${firstName} ${lastName}`, classId})
        .where(eq(Student.userId, userId))
        .catch(() => error = true);

    if(error) return new NextResponse(null, { status: 500 });

    return new NextResponse();
}

export async function DELETE(request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { userId } : { userId: string } = await request.json();
    let error = false;

    await clerkClient.users.deleteUser(userId).catch(() => error = true);

    await db.delete(Student).where(eq(Student.userId, userId)).catch(() => error = true);

    if(error) return new NextResponse(null, { status: 500 });

    return new NextResponse();
}