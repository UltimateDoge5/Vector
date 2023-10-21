"use client";

import { type ClassPresence } from "./teacherView";

export function PresenceDrawer({}: PresenceDrawerProps) {
	return (
		<div className="z-10">
			<div className="flex flex-col items-center justify-center">
				<h2 className="text-2xl">Obecności </h2>
			</div>
		</div>
	);
}

interface PresenceDrawerProps {
	presence: ClassPresence;
	setPresence: (presence: ClassPresence) => void;
	isOpen: boolean;
	setOpen: (isOpen: boolean) => void;
}
