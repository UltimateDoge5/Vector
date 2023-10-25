import { relations } from "drizzle-orm";
import { bigint, boolean, int, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const Assignment = mysqlTable("assignment", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	classId: bigint("classId", { mode: "number" }).notNull(),
	teacherId: bigint("teacherId", { mode: "number" }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	description: varchar("description", { length: 255 }),
	dueDate: timestamp("due_date", { mode: "date" }).notNull(),
	creationDate: timestamp("creation_date", { mode: "date" }).defaultNow(),
});

export const Exemptions = mysqlTable("exemption", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	scheduleId: bigint("scheduleId", { mode: "number" }),
	date: timestamp("date", { mode: "date" }).notNull(),
	reason: varchar("reason", { length: 255 }),
	teacherId: bigint("teacherId", { mode: "number" }).notNull(),
	lessonId: bigint("lessonId", { mode: "number" }),
	classId: bigint("classId", { mode: "number" }),
	room: varchar("room", { length: 8 }),
	dayOfWeek: int("day_od_week"),
	index: int("index"),
	type: mysqlEnum("type", ["cancelation", "addition", "change"]).notNull(),
});

export const Schedule = mysqlTable("schedule", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	classId: bigint("classId", { mode: "number" }).notNull(),
	teacherId: bigint("teacherId", { mode: "number" }).notNull(),
	lessonId: bigint("lessonId", { mode: "number" }).notNull(),
	room: varchar("room", { length: 8 }).notNull(),
	dayOfWeek: int("day_od_week").notNull(),
	index: int("index").notNull(),
});
export const LessonGroup = mysqlTable("lessonGroup", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	lessonId: bigint("lessonId", { mode: "number" })
		.notNull(),
	teacherId: bigint("teacherId", { mode: "number" })
		.notNull(),
	classId: bigint("classId", { mode: "number" })
		.notNull(),
});

export const Grade = mysqlTable("grade", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	studentId: bigint("studentId", { mode: "number" }).notNull(),
	definitionId: bigint("definitionId", { mode: "number" }).notNull(),
	timestamp: timestamp("timestamp", { mode: "date" }).notNull(),
	description: varchar("description", { length: 255 }),
	grade: int("grade").notNull(),
});

export const GradeDefinition = mysqlTable("gradeDefinition", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	lessonId: bigint("lessonId", { mode: "number" }).notNull(),
	name: varchar("name", { length: 255 }),
	weight: int("weight").notNull(),
});

export const Presence = mysqlTable("presence", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	exemptionId: bigint("exemptionId", { mode: "number" }),
	tableId: bigint("tableId", { mode: "number" }),
	studentId: bigint("studentId", { mode: "number" }).notNull(),
	date: timestamp("date", { mode: "date" }).notNull(),
	status: mysqlEnum("status", ["present", "absent", "late", "released", "releasedBySchool"]).notNull(),
});

export const Lesson = mysqlTable("lesson", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	name: varchar("name", { length: 255 }).notNull(),
});

export const Class = mysqlTable("class", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	teacherId: bigint("teacherId", { mode: "number" }).notNull().unique(),
	name: varchar("name", { length: 255 }).notNull(),
});

export const Teacher = mysqlTable("teacher", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	userId: varchar("userId", { length: 32 }).notNull(),
	classId: bigint("classId", { mode: "number" }).unique(),
	name: varchar("name", { length: 255 }).notNull(),
	admin: boolean("admin").default(false),
});

export const Student = mysqlTable("student", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	userId: varchar("userId", { length: 32 }).notNull(),
	classId: bigint("classId", { mode: "number" }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
});

export const teacherRelations = relations(Teacher, ({ one, many }) => ({
	class: one(Class, {
		fields: [Teacher.classId],
		references: [Class.id],
	}),
	schedule: one(Schedule, {
		fields: [Teacher.id],
		references: [Schedule.teacherId],
	}),
	assignments: one(Assignment, {
		fields: [Teacher.id],
		references: [Assignment.teacherId],
	}),
	exemptions: many(Exemptions),
	lessonGroup: one(LessonGroup, {
		fields: [Teacher.id],
		references: [LessonGroup.teacherId],
	}),
}));

export const classRelations = relations(Class, ({ many, one }) => ({
	teacher: one(Teacher, {
		fields: [Class.teacherId],
		references: [Teacher.id],
	}),
	students: many(Student),
	schedule: many(Schedule),
	assignments: many(Assignment),
	lessonGroup: one(LessonGroup, {
		fields: [Class.id],
		references: [LessonGroup.classId],
	}),
}));

export const lessonGroupRelations = relations(LessonGroup, ({ many }) => ({
	leeson: many(Lesson),
	class: many(Class),
	teacher: many(Teacher),
}));

export const studentRelations = relations(Student, ({ many, one }) => ({
	class: one(Class, {
		fields: [Student.classId],
		references: [Class.id],
	}),
	grades: many(Grade),
	presences: many(Presence),
}));

export const scheduleRelations = relations(Schedule, ({ one, many }) => ({
	class: one(Class, {
		fields: [Schedule.classId],
		references: [Class.id],
	}),
	lesson: one(Lesson, {
		fields: [Schedule.lessonId],
		references: [Lesson.id],
	}),
	teacher: one(Teacher, {
		fields: [Schedule.teacherId],
		references: [Teacher.id],
	}),
	presences: one(Presence, {
		fields: [Schedule.id],
		references: [Presence.tableId],
	}),
	exemptions: many(Exemptions),
}));

export const lessonRelations = relations(Lesson, ({ many, one }) => ({
	schedule: many(Schedule),
	lessonGroup: one(LessonGroup, {
		fields: [Lesson.id],
		references: [LessonGroup.lessonId],
	}),
	gradeDefinition: one(GradeDefinition, {
		fields: [Lesson.id],
		references: [GradeDefinition.id],
	}),
}));

export const gradeRelations = relations(Grade, ({ one }) => ({
	student: one(Student, {
		fields: [Grade.studentId],
		references: [Student.id],
	}),
	gradeDefinition: one(GradeDefinition, {
		fields: [Grade.id],
		references: [GradeDefinition.id],
	}),
}));

export const gradeDefinitionRelations = relations(GradeDefinition, ({ one, many }) => ({
	lesson: one(Lesson, {
		fields: [GradeDefinition.lessonId],
		references: [Lesson.id],
	}),
	grade: many(Grade),
}));

export const presenceRelations = relations(Presence, ({ one }) => ({
	student: one(Student, {
		fields: [Presence.studentId],
		references: [Student.id],
	}),
	table: one(Schedule, {
		fields: [Presence.tableId],
		references: [Schedule.id],
	}),
}));

export const assignmentsRelations = relations(Assignment, ({ one }) => ({
	class: one(Class, {
		fields: [Assignment.classId],
		references: [Class.id],
	}),
	teacher: one(Teacher, {
		fields: [Assignment.teacherId],
		references: [Teacher.id],
	}),
}));

export const exemptionsRelations = relations(Exemptions, ({ one }) => ({
	schedule: one(Schedule, {
		fields: [Exemptions.scheduleId],
		references: [Schedule.id],
	}),
	lesson: one(Lesson, {
		fields: [Exemptions.lessonId],
		references: [Lesson.id],
	}),
	teacher: one(Teacher, {
		fields: [Exemptions.teacherId],
		references: [Teacher.id],
	}),
	class: one(Class, {
		fields: [Exemptions.classId],
		references: [Class.id],
	}),
}));
