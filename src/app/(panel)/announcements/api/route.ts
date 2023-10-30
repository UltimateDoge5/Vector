import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Announcements } from "~/server/db/schema";

export async function POST(request: Request) {
	const body = (await request.json()) as unknown;

	const schema = z.object({
		name: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		recipients: z.object({
			classes: z.array(z.number()),
			teachers: z.boolean(),
		}),
	});

	const parsedData = schema.safeParse(body);

	if (!parsedData.success) {
		return new NextResponse(JSON.stringify(parsedData.error), { status: 400 });
	}

	const res = await db.insert(Announcements).values(parsedData.data);

	return NextResponse.json({ id: res.insertId }, { status: 201 });
}
