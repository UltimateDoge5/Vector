"use client";
import { type AssignmentDto, type SubmissionDto } from "~/types/dtos";
import { submittedAtFormat } from "~/app/(panel)/assignments/[nameId]/view";
import Link from "next/link";
import dayjs from "dayjs";
import React from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

export function TeacherAssignmentView({ assignment, submissions }: { assignment: AssignmentDto; submissions: StudentSubmissions[] }) {
	return (
		<>
			<div className="mb-1 flex items-center gap-2 text-sm">
				<Link href={`/assignments`} className="hover:underline">
					Zadania
				</Link>
				<ChevronRightIcon className="inline h-5 w-5" />
				<Link href={`/assignments/${linkify(assignment.name, assignment.id)}`} className="hover:underline">
					{assignment.name}
				</Link>
			</div>
			<div className="flex items-end justify-between border-b py-4">
				<div className="flex flex-col gap-1">
					<h2 className="border-l-4 border-accent pl-2 text-2xl font-bold">Zadanie - {assignment.name}</h2>
					<p className="max-w-3xl font-light text-text/80">{assignment.description}</p>
				</div>
			</div>

			<h2 className="mt-2 text-xl font-medium">Zwrócone zadania</h2>
			<div className="w-3/4">
				{submissions.map((submission) => (
					<Link
						key={submission.id}
						className="flex w-full flex-col gap-2 rounded-md bg-slate-100/70 p-2 transition-colors hover:bg-slate-200/70"
						href={`/assignments/${linkify(assignment.name, assignment.id)}/submission/${linkify(
							submission.student.name,
							submission.id,
						)}`}
					>
						<h3 className="text-xl">{submission.student.name}</h3>

						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2">
								Wysłano: <span className="text-lime-700">{submittedAtFormat.format(submission.sentAt)}</span>
								{dayjs(submission.sentAt).isAfter(assignment.dueDate) && <span className="text-red-700">Spóźnione</span>}
							</div>
						</div>
					</Link>
				))}
			</div>
		</>
	);
}

export const linkify = (text: string, id: number) => text.toLowerCase().replaceAll(" ", "-") + "-" + id;

type StudentSubmissions = SubmissionDto & {
	student: {
		id: number;
		name: string;
	};
};
