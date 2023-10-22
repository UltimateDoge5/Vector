import { clerkClient } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { UserType } from '~/enums/UserType';
import { db } from '~/server/db';
import { Class, Student } from '~/server/db/schema';

export async function POST(request: Request) {
     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { firstName, lastName, email, classId } : {firstName: string, lastName: string, email: string, classId: number} = await request.json();
    const defaultUserPassword = `${firstName}_${lastName}_${Math.floor(Math.random() * 10000)}`;

    try {
        const newRegisteredUser = await clerkClient.users.createUser({
            firstName,
            lastName,
            emailAddress: [email],
            password: defaultUserPassword,
            privateMetadata: {
                role: UserType.STUDENT
            }
        });
    
        await db.insert(Student).values(
            {
                userId: newRegisteredUser?.id,
                name: `${firstName} ${lastName}`,
                classId,
            }
        );
    
        const newCreatedStudent = await db.select(
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
            .limit(1);
    
        return NextResponse.json({ ...newCreatedStudent[0], password: defaultUserPassword } );
    }
    catch(exception) {
        console.log(exception);
        return new NextResponse(JSON.stringify({message: exception?.errors[0].message as string}), { status: exception?.status as number});
    }
}

export async function PUT(request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { userId, firstName, lastName, classId } : { userId: string, firstName: string, lastName: string, classId: number } = await request.json();

    try {
        await clerkClient.users.updateUser(userId, 
            { 
                firstName, 
                lastName,
            });
    
        await db.update(Student)
            .set({name: `${firstName} ${lastName}`, classId})
            .where(eq(Student.userId, userId));
    
        return new NextResponse();
    }
    catch(exception) {
        console.log(exception);
        return new NextResponse(JSON.stringify({message: exception?.errors[0].message as string}), { status: exception?.status as number});
    }
}

export async function DELETE(request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { userId } : { userId: string } = await request.json();

    try {
        await clerkClient.users.deleteUser(userId);

        await db.delete(Student).where(eq(Student.userId, userId));
    
        return new NextResponse();
    }
    catch(exception) {
        console.log(exception);
        return new NextResponse(JSON.stringify({message: exception?.errors[0].message as string}), { status: exception?.status as number});
    }
}