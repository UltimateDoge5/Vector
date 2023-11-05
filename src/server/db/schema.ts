import { relations } from "drizzle-orm";
import { bigint, boolean, int, mysqlEnum, json, mysqlTable, timestamp, varchar, date, text } from "drizzle-orm/mysql-core";

export const Submission = mysqlTable("submission", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	assignmentId: bigint("assignmentId", { mode: "number" }).notNull(),
	studentId: bigint("studentId", { mode: "number" }).notNull(),
	sentAt: timestamp("sent_at", { mode: "date" }).defaultNow().notNull(),
	content: text("content"),
	attachment: varchar("attachment", { length: 255 }),
	graded: boolean("graded").default(false).notNull(),
});

export const Assignment = mysqlTable("assignment", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	classId: bigint("classId", { mode: "number" }).notNull(),
	teacherId: bigint("teacherId", { mode: "number" }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	dueDate: timestamp("due_date", { mode: "date" }).notNull(),
	creationDate: timestamp("creation_date", { mode: "date" }).defaultNow().notNull(),
	allowLate: boolean("allow_late").default(false).notNull(),
	fileRequired: boolean("file_required").default(false).notNull(),
});

export const Announcements = mysqlTable("announcement", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	date: timestamp("date", { mode: "date" }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	description: varchar("description", { length: 255 }),
	recipients: json("recipients").$type<{ teachers: boolean; classes: number[] }>(),
});

export const Exemptions = mysqlTable("exemption", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	scheduleId: bigint("scheduleId", { mode: "number" }),
	date: date("date", { mode: "date" }).notNull(),
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

export const Grade = mysqlTable("grade", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	studentId: bigint("studentId", { mode: "number" }).notNull(),
	definitionId: bigint("definitionId", { mode: "number" }).notNull(),
	timestamp: timestamp("timestamp", { mode: "date" }).notNull(),
	description: varchar("description", { length: 255 }),
	grade: int("grade").notNull(),
});

export const LessonGroup = mysqlTable("lessonGroup", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	lessonId: bigint("lessonId", { mode: "number" }).notNull(),
	teacherId: bigint("teacherId", { mode: "number" }).notNull(),
	classId: bigint("classId", { mode: "number" }).notNull(),
});

// Group teachers and lessons by class
export const GradeDefinition = mysqlTable("gradeDefinition", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	lessonGroupId: bigint("lessonGroupId", { mode: "number" }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	weight: int("weight").notNull(),
});

export const Presence = mysqlTable("presence", {
	id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
	exemptionId: bigint("exemptionId", { mode: "number" }),
	tableId: bigint("tableId", { mode: "number" }),
	studentId: bigint("studentId", { mode: "number" }).notNull(),
	date: date("date", { mode: "date" }).notNull(),
	status: mysqlEnum("status", ["present", "absent", "late", "excused", "released", "releasedBySchool"]).notNull(),
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

export const lessonGroupRelations = relations(LessonGroup, ({ many,one }) => ({
	lesson: one(Lesson,{
		fields: [LessonGroup.lessonId],
		references: [Lesson.id],
	}),
	class: many(Class),
	teacher: many(Teacher),
	gradeDefinitions: many(GradeDefinition),
}));

export const studentRelations = relations(Student, ({ many, one }) => ({
	class: one(Class, {
		fields: [Student.classId],
		references: [Class.id],
	}),
	grades: many(Grade),
	presences: many(Presence),
	submissions: many(Submission),
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

export const lessonRelations = relations(Lesson, ({ many }) => ({
	schedule: many(Schedule),
	lessonGroup: many(LessonGroup),
}));

export const gradeRelations = relations(Grade, ({ one }) => ({
	student: one(Student, {
		fields: [Grade.studentId],
		references: [Student.id],
	}),
	gradeDefinition: one(GradeDefinition, {
		fields: [Grade.definitionId],
		references: [GradeDefinition.id],
	}),
}));

export const gradeDefinitionRelations = relations(GradeDefinition, ({ one, many }) => ({
	grades: many(Grade),
	lessonGroup: one(LessonGroup,{
		fields: [GradeDefinition.lessonGroupId],
		references: [LessonGroup.id],
	}),
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

export const assignmentRelations = relations(Assignment, ({ one,many }) => ({
	class: one(Class, {
		fields: [Assignment.classId],
		references: [Class.id],
	}),
	teacher: one(Teacher, {
		fields: [Assignment.teacherId],
		references: [Teacher.id],
	}),
	sentAssignments: many(Submission)
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

export const submissionRelations = relations(Submission, ({ one }) => ({
	assignment: one(Assignment, {
		fields: [Submission.assignmentId],
		references: [Assignment.id],
	}),
	student: one(Student, {
		fields: [Submission.studentId],
		references: [Student.id],
	}),
}));
