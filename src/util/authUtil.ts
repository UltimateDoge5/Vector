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

export const getSelectedClass = (): number => parseInt(cookies().get("selectedClassId")?.value ?? "1");

export const generateDefaultPassword = (firstname: string, lastname: string): string => {
	let defaultPassword = `${firstname}_${lastname}_`;

	for(let i = 0; i < 4; i++) defaultPassword += Math.floor(Math.random() * 10);
	
	return defaultPassword;
}