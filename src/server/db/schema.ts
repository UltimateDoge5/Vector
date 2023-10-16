import {
  bigint,
  boolean,
  int,
  mysqlEnum,
  mysqlTableCreator,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
export const mysqlTable = mysqlTableCreator((name) => `${name}`);

export const Assignment = mysqlTable("assignment", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  classId: bigint("classId", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  creationDate: timestamp("creation_date", { mode: "date" }).defaultNow(),
});

export const Exemptions = mysqlTable("exemption", {
  tableId: bigint("id", { mode: "number" }).primaryKey().notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
});

export const Schedule = mysqlTable("schedule", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  classId: bigint("id", { mode: "number" }).notNull(),
  lessonId: bigint("lessonId", { mode: "number" }).notNull(),
  dayOfWeek: int("day_od_week").notNull(),
  index: int("index").notNull(),
});

export const Grade = mysqlTable("grade", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  studentId: bigint("id", { mode: "number" }).notNull(),
  lessonId: bigint("lessonId", { mode: "number" }).notNull(),
  grade: int("grade").notNull(),
  weight: int("weight").notNull(),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull(),
  description: varchar("description", { length: 255 }),
});

export const Presence = mysqlTable("presence", {
  tableId: bigint("id", { mode: "number" }).primaryKey().notNull(),
  studentId: bigint("studentId", { mode: "number" }).notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  status: mysqlEnum("status", [
    "present",
    "absent",
    "late",
    "released",
    "releasedBySchool",
  ]).notNull(),
});

export const Lesson = mysqlTable("lesson", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
});

export const Class = mysqlTable("class", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  teacherId: bigint("id", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }),
});

export const Teacher = mysqlTable("teacher", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }),
  classId: bigint("id", { mode: "number" }).notNull(),
  admin: boolean("admin").default(false),
});

export const Student = mysqlTable("student", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }),
  classId: bigint("id", { mode: "number" }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
});
