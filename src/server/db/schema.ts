import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	int,
	mysqlEnum,
	mysqlTable,
	timestamp,
	varchar
} from "drizzle-orm/mysql-core";

export const Assignment = mysqlTable("assignment", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	classId: bigint("classId", { mode: "number" }).notNull(),
	teacherId: bigint("teacherId", { mode: "number" }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	description: varchar("description", { length: 255 }),
	dueDate: timestamp("due_date", { mode: "date" }).notNull(),
	creationDate: timestamp("creation_date", { mode: "date" }).defaultNow()
});

export const Exemptions = mysqlTable("exemption", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	tableId: bigint("id", { mode: "number" }).primaryKey().notNull(),
	date: timestamp("date", { mode: "date" }).notNull()
});

export const Schedule = mysqlTable("schedule", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	classId: bigint("classId", { mode: "number" }).notNull(),
	teacherId: bigint("teacherId", { mode: "number" }).notNull(),
	lessonId: bigint("lessonId", { mode: "number" }).notNull(),
	room:varchar("room", { length: 8 }).notNull(),
	dayOfWeek: int("day_od_week").notNull(),
	index: int("index").notNull()
});

export const Grade = mysqlTable("grade", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	studentId: bigint("studentId", { mode: "number" }).notNull(),
	lessonId: bigint("lessonId", { mode: "number" }).notNull(),
	grade: int("grade").notNull(),
	weight: int("weight").notNull(),
	timestamp: timestamp("timestamp", { mode: "date" }).notNull(),
	description: varchar("description", { length: 255 })
});

export const Presence = mysqlTable("presence", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	tableId: bigint("tableId", { mode: "number" }).notNull(),
	studentId: bigint("studentId", { mode: "number" }).notNull(),
	date: timestamp("date", { mode: "date" }).notNull(),
	status: mysqlEnum("status", [
		"present",
		"absent",
		"late",
		"released",
		"releasedBySchool"
	]).notNull()
});

export const Lesson = mysqlTable("lesson", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	name: varchar("name", { length: 255 }).notNull()
});

export const Class = mysqlTable("class", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	teacherId: bigint("teacherId", { mode: "number" }).notNull(),
	name: varchar("name", { length: 255 }).notNull()
});

export const Teacher = mysqlTable("teacher", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	userId: varchar("userId", { length: 32 }).notNull(),
	classId: bigint("classId", { mode: "number" }),
	name: varchar("name", { length: 255 }).notNull(),
	admin: boolean("admin").default(false)
});

export const Student = mysqlTable("student", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	userId: varchar("userId", { length: 32 }).notNull(),
	classId: bigint("classId", { mode: "number" }).notNull(),
	name: varchar("name", { length: 255 }).notNull()
});

export const teacherRelations = relations(Teacher, ({ one }) => ({
	class: one(Class, {
		fields: [Teacher.classId],
		references: [Class.id]
	}),
	schedule: one(Schedule),
	assignments: one(Assignment)
}));

export const classRelations = relations(Class, ({ many, one }) => ({
	teacher: one(Teacher, {
		fields: [Class.teacherId],
		references: [Teacher.id]
	}),
	students: many(Student),
	schedule: many(Schedule),
	assignments: many(Assignment)
}));

export const studentRelations = relations(Student, ({ many, one }) => ({
	class: one(Class, {
		fields: [Student.classId],
		references: [Class.id]
	}),
	grades: many(Grade),
	presences: many(Presence)
}));

export const scheduleRelations = relations(Schedule, ({ one, many }) => ({
	class: one(Class, {
		fields: [Schedule.classId],
		references: [Class.id]
	}),
	lesson: one(Lesson, {
		fields: [Schedule.lessonId],
		references: [Lesson.id]
	}),
	teacher: one(Teacher, {
		fields: [Schedule.teacherId],
		references: [Teacher.id]
	}),
	presences: one(Presence, {
		fields: [Schedule.id],
		references: [Presence.tableId]
	}),
	exemptions: many(Exemptions)
}));

export const lessonRelations = relations(Lesson, ({ many }) => ({
	schedule: many(Schedule),
	grades: many(Grade)
}));

export const gradeRelations = relations(Grade, ({ one }) => ({
	student: one(Student, {
		fields: [Grade.studentId],
		references: [Student.id]
	}),
	lesson: one(Lesson, {
		fields: [Grade.lessonId],
		references: [Lesson.id]
	})
}));

export const presenceRelations = relations(Presence, ({ one }) => ({
	student: one(Student, {
		fields: [Presence.studentId],
		references: [Student.id]
	}),
	table: one(Schedule, {
		fields: [Presence.tableId],
		references: [Schedule.id]
	})
}));

export const assignmentsRelations = relations(Assignment, ({ one }) => ({
	class: one(Class, {
		fields: [Assignment.classId],
		references: [Class.id]
	}),
	teacher: one(Teacher, {
		fields: [Assignment.teacherId],
		references: [Teacher.id]
	})
}));

export const exemptionsRelations = relations(Exemptions, ({ one }) => ({
	table: one(Schedule, {
			fields: [Exemptions.tableId],
			references: [Schedule.id]
		}
	)
}));