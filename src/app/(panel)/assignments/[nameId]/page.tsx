import { db } from "~/server/db";

export default async function AssignmentPage({ params }: { params: { nameId: string } }) {
	const id = params.nameId.split("-").pop();
	if (!id || isNaN(parseInt(id))) return <h1>Takie zadanie nie istnieje</h1>;

	const assignment = await db.query.Assignment.findFirst({
		where: (c, { eq }) => eq(c.id, parseInt(id)),
	});

	if(!assignment) return <h1>Takie zadanie nie istnieje</h1>;

	return <h2 className="mb-3 border-l-4 border-accent pl-2 text-2xl font-bold">Zadanie - {assignment.name}</h2>;
}