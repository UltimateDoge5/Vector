"use client";
import { type AssignmentDto, type SubmissionDto } from "~/types/dtos";
import { ArrowDownTrayIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { Button } from "~/components/ui/button";
import React, { useState } from "react";
import Link from "next/link";
import { linkify } from "../../teacherView";

export function StudentsSubmissionView({
	assignment,
	submission,
	studentName,
}: {
	assignment: AssignmentDto;
	submission: SubmissionDto;
	studentName: string;
}) {
	const [graded, setGraded] = useState(submission.graded ?? false);
	const isAttachmentImage = // This variable is only used when the submission has an attachment
		submission.attachment!.endsWith(".png") || submission.attachment!.endsWith(".jpg") || submission.attachment!.endsWith(".jpeg");

	const updateGrading = async () => {
		await fetch(`/assignments/graded`, {
			method: "PUT",
			body: JSON.stringify({
				graded: !graded,
				submissionId: submission.id,
			}),
		});
	};

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
				<ChevronRightIcon className="inline h-5 w-5" />
				<Link
					href={`/assignments/${linkify(assignment.name, assignment.id)}/submission/${linkify(studentName, submission.id)}`}
					className="hover:underline"
				>
					Praca {capitalizeName(studentName)}
				</Link>
			</div>
			<div className="flex items-end justify-between border-b py-4">
				<div className="flex flex-col gap-1">
					<h2 className="border-l-4 border-accent pl-2 text-2xl font-bold">Praca - {capitalizeName(studentName)}</h2>
					<p className="max-w-3xl font-light text-text/80">{assignment.description}</p>
				</div>
				<div>
					<input
						id="graded"
						type="checkbox"
						checked={graded}
						onChange={async (e) => {
							setGraded(e.target.checked);
							await updateGrading();
						}}
					/>
					<label htmlFor="graded" className="ml-2">
						Ocenione
					</label>
				</div>
			</div>

			<div className="mt-4 grid h-[200px] grid-cols-[300px,2px,auto] gap-4 ">
				<div>
					<label className="font-medium" htmlFor="attachment">
						Praca ucznia
					</label>
					<div className="relative mt-2 flex h-[200px] w-[300px] flex-col items-center justify-center gap-2 rounded-lg border bg-secondary/10 p-2 text-center">
						{!submission.attachment ? (
							<span>Brak załącznika</span>
						) : isAttachmentImage ? (
							<img
								src={`https://utfs.io/f/${submission.attachment}`}
								className="h-full w-full object-contain"
								alt="Załącznik ucznia"
							/>
						) : (
							submission.attachment
						)}
					</div>

					{submission.attachment && (
						<a href={`https://utfs.io/f/${submission.attachment}`} target="_blank">
							<Button color="secondary" className="mt-2 w-full gap-2" icon={<ArrowDownTrayIcon className="h-5 w-5" />}>
								Pobierz
							</Button>
						</a>
					)}
				</div>
				<div className="mt-7 w-[2px] bg-accent/20" />
				<div>
					<label className="font-medium" htmlFor="attachment">
						Odpowiedź ucznia
					</label>
					<textarea
						className="mt-2 w-full resize-none overflow-auto rounded-lg border bg-secondary/10 p-2 text-text focus:border-blue-500 focus:ring-blue-500"
						placeholder="Odpowiedź"
						id="answer"
						rows={10}
						value={submission.content ?? "Brak odpowiedzi"}
						disabled
					/>
				</div>
			</div>
		</>
	);
}

const capitalizeName = (name: string) =>
	name
		.split(" ")
		.map((s) => s[0]!.toUpperCase() + s.slice(1))
		.join(" ");
