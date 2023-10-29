import { type User } from "@clerk/nextjs/dist/types/server";
import { cookies } from "next/headers";
import "server-only";

export const isTeacher = (user: User | null): boolean => {
	if (!user) return false;
	return (user.privateMetadata.role ?? "student") !== "student";
};

export const isStudent = (user: User | null): boolean => {
	if (!user) return false;
	return (user.privateMetadata.role ?? "student") === "student";
};

export const isAdmin = (user: User | null): boolean => {
	if (!user) return false;
	return (user.privateMetadata.role ?? "student") === "admin";
};

export const getSelectedClass = (): number => parseInt(cookies().get("selectedClassId")?.value ?? "-1");
