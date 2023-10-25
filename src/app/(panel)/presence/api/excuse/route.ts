import { currentUser } from "@clerk/nextjs";
import { and, eq, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Presence } from "~/server/db/schema";
import { isStudent } from "~/util/authUtil";

export async function PUT(req: NextRequest) {
	const user = await currentUser();
	if (!isStudent(user!)) return new NextResponse(null, { status: 401 });

	const jsonData = (await req.json()) as unknown;
	const schema = z.object({
		excuses: z.array(
			z.object({
				scheduleId: z.number(),
				exemptionId: z.number(),
				date: z.coerce.date(),
			}),
		),
		date: z.coerce.date(),
	});

	const parsedData = schema.safeParse(jsonData);

	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), { status: 400 });
	}

	const excuses = parsedData.data;

	const { id } = (await db.query.Student.findFirst({
		where: (s, { eq }) => eq(s.userId, user!.id),
		columns: {
			id: true,
		},
	}))!;

	await Promise.allSettled(
		excuses.excuses.map(async (change) => {
			await db
				.update(Presence)
				.set({ status: "excused" })
				.where(
					and(
						eq(Presence.studentId, id),
						and(eq(Presence.tableId, change.scheduleId), eq(Presence.exemptionId, change.exemptionId)),
						eq(Presence.date, change.date),
					),
				);
		}),
	);

	return new NextResponse(null, { status: 200 });
}
