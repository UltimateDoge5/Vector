import { currentUser } from "@clerk/nextjs";
import { and, eq, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Presence } from "~/server/db/schema";

export async function PUT(req: NextRequest) {
	const user = await currentUser();

	if ((user?.privateMetadata.role ?? "student") === "student") {
		return new NextResponse(null, { status: 401 });
	}

	const jsonData = (await req.json()) as unknown;
	const schema = z.array(
		z.object({
			scheduleId: z.number(),
			studentId: z.number(),
			status: z.enum(["present", "absent", "late", "excused", "releasedBySchool"]),
			exemptionId: z.number(),
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
			const updateResult = await db
				.update(Presence)
				.set({ status: change.status })
				.where(
					and(
						eq(Presence.studentId, change.studentId),
						or(eq(Presence.tableId, change.scheduleId), eq(Presence.exemptionId, change.exemptionId)),
					),
				);

			if (updateResult.rowsAffected === 0) {
				await db.insert(Presence).values({
					studentId: change.studentId,
					status: change.status,
					date: change.date,
					...(change.scheduleId !== -1 && { tableId: change.scheduleId }),
					...(change.exemptionId !== -1 && { exemptionId: change.exemptionId }),
				});
			}
		}),
	);

	return new NextResponse(null, { status: 200 });
}
