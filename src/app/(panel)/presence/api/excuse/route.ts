import { currentUser } from "@clerk/nextjs";
import { and, eq, isNull, or } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Presence } from "~/server/db/schema";
import { isStudent } from "~/util/authUtil";

export async function PUT(req: NextRequest) {
	const user = await currentUser();
	if (!isStudent(user)) return new NextResponse(null, { status: 401 });

	const jsonData = (await req.json()) as unknown;
	const schema = z.object({
		excuses: z.array(
			z.object({
				scheduleId: z.number().nullable(),
				exemptionId: z.number().nullable(),
			}),
		),
		date: z.coerce.date(),
	});

	const parsedData = schema.safeParse(jsonData);

	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), { status: 400 });
	}

	const { id } = (await db.query.Student.findFirst({
		where: (s, { eq }) => eq(s.userId, user!.id),
		columns: {
			id: true,
		},
	}))!;

	// TODO: Technicaly we should check here if the excuse is legal (student didn't go home eariler)
	// We would need to fetch the data and reassemble it (like in the page.tsx files before views)
	await Promise.allSettled(
		parsedData.data.excuses.map(async (change) => {
			await db
				.update(Presence)
				.set({ status: "excused" })
				.where(
					and(
						eq(Presence.studentId, id),
						eq(Presence.date, parsedData.data.date),
						or(
							and(eq(Presence.tableId, change.scheduleId ?? -1), isNull(Presence.exemptionId)),
							and(eq(Presence.exemptionId, change.exemptionId ?? -1), isNull(Presence.tableId)),
						),
					),
				);
		}),
	);

	return new NextResponse(null, { status: 200 });
}
