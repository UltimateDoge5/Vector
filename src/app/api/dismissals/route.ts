import { currentUser } from "@clerk/nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Presence } from "~/server/db/schema";

export async function POST(req: NextRequest) {
	const user = (await currentUser())!;
	const body = (await req.json()) as unknown;

	const schema = z.object({
		dismissals: z.array(
			z.object({
				scheduleId: z.number(),
				exceptionId: z.number(),
			}),
		),
		date: z.coerce.date(),
	});

	const parsedData = schema.safeParse(body);
	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), {
			status: 400,
		});
	}

	const data = parsedData.data;

	const studentId = await db.query.Student.findFirst({
		where: (student, { eq }) => eq(student.userId, user.id),
		columns: {
			id: true,
		},
	});

	if (!studentId) {
		return new NextResponse("Student not found", {
			status: 400,
		});
	}

	// TODO: Send request to the teacher
	await Promise.allSettled(
		data.dismissals.map(async (dismission) => {
			await db.insert(Presence).values({
				tableId: dismission.scheduleId,
				exemptionId: dismission.exceptionId,
				studentId: studentId.id,
				status: "released",
				date: data.date,
			});
		}),
	);

	return new NextResponse(null, {
		status: 201,
	});
}
