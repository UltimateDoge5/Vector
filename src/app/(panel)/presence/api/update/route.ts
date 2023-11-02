import { currentUser } from "@clerk/nextjs";
import { and, eq, or } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Presence } from "~/server/db/schema";
import { isStudent } from "~/util/authUtil";

export async function PUT(req: NextRequest) {
	const user = await currentUser();

	if (isStudent(user)) {
		return new NextResponse(null, { status: 401 });
	}

	const jsonData = (await req.json()) as unknown;
	const schema = z.array(
		z.object({
			scheduleId: z.number().nullable(),
			studentId: z.number(),
			status: z.enum(["present", "absent", "late", "excused", "releasedBySchool"]),
			exemptionId: z.number().nullable(),
			date: z.coerce.date(),
		}),
	);

	const parsedData = schema.safeParse(jsonData);

	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), { status: 400 });
	}

	const changes = parsedData.data;

	// TODO: Maybe make this into a transaction? That would make error handling easier
	await Promise.allSettled(
		changes.map(async (change) => {
			// Either scheduleId or exemptionId will be null
			const idClause =
				change.scheduleId !== null ? eq(Presence.tableId, change.scheduleId) : eq(Presence.exemptionId, change.exemptionId!);

			const updateResult = await db
				.update(Presence)
				.set({ status: change.status })
				.where(and(eq(Presence.studentId, change.studentId), eq(Presence.date, change.date), idClause));

			if (updateResult.rowsAffected === 0) {
				console.log("inserting");
				await db.insert(Presence).values({
					studentId: change.studentId,
					status: change.status,
					date: change.date,
					tableId: change.scheduleId,
					exemptionId: change.exemptionId,
				});
			}
		}),
	);

	return new NextResponse(null, { status: 200 });
}
