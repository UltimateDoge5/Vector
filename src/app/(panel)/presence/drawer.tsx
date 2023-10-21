"use client";

import { type ClassPresence } from "./teacherView";
import { legend } from "./view";

export function PresenceDrawer({ presence }: PresenceDrawerProps) {
	console.log(presence);
	return (
		<div
			className="fixed right-0 top-0 z-40 h-screen w-2/3 min-w-[256px] overflow-y-auto rounded-l-lg bg-white p-4"
			aria-labelledby="drawer-label"
		>
			<div className="flex flex-col items-center justify-center">
				<h2 className="text-2xl">Obecności {presence.lessonName}</h2>
				<p>
					{presence.hours.from}-{presence.hours.to} | {presence.teacherName}
				</p>

				<div className="flex w-full flex-col gap-2">
					{Object.entries(presence.students).map(([studentId, student]) => (
						<div key={studentId} className="flex items-center gap-2">
							{student.name} - <div className={`h-5 w-5 rounded-md ${legend[student.status].color}`} />
							<p className="text-lg">{legend[student.status].text}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

interface PresenceDrawerProps {
	presence: ClassPresence;
	setPresence: (presence: ClassPresence) => void;
}
