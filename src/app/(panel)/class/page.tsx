import { db } from "~/server/db";
import ClassView from "./view";
export const runtime = "edge";

export default async function SchedulePage() {
	const { teachers, classes } = await getDataForTeachers();

	return <ClassView teachers={teachers} classes={classes} />;
}

const getDataForTeachers = async () => {
	const classes = await db.query.Class.findMany({
		with: { teacher: { columns: { name: true, id: true } } },
	});

	const teachers = await db.query.Teacher.findMany({
		where: (teach, { isNull }) => isNull(teach.classId),
		columns: { id: true, classId: true, name: true },
	});
	return { teachers, classes };
};

export interface teachersInterface {
	id: number;
	name: string;
}
