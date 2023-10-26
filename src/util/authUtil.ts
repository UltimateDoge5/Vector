import { type User } from "@clerk/nextjs/dist/types/server";
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
