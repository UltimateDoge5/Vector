"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { uploadFiles } from "~/util/uploadHelpers";
import dayjs from "dayjs";
import type { AssignmentDto, SubmissionDto } from "~/types/dtos";

export const submittedAtFormat = new Intl.DateTimeFormat("pl-PL", {
	year: "numeric",
	month: "long",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
});

export function AssignmentView({
	assignment,
	submission: submissionInit,
	studentId,
}: {
	assignment: AssignmentDto;
	submission: SubmissionDto | undefined;
	studentId: number;
}) {
	// I could just use the submission state, but I have more stuff to do now than refactor this
	const [answerFile, setAnswerFile] = useState<File | undefined>(undefined);
	const [answerText, setAnswerText] = useState("");
	const [submission, setSubmission] = useState<SubmissionDto | undefined>(submissionInit);

	const uploadRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const AssignmentStatus = () => {
		const btn = (
			<Button
				disabled={isUploading || (assignment.fileRequired ? !answerFile : false) || (!answerFile && !answerText) }
				loading={isUploading}
				onClick={handleSubmit}
			>
				Wyślij rozwiązanie
			</Button>
		);

		const isLate = dayjs().isAfter(dayjs(assignment.dueDate));

		if (!submission) {
			if (isLate && !assignment.allowLate) {
				return <span className="text-red-500">Nie wysłano w terminie</span>;
			} else {
				return btn;
			}
		}

		if (isLate) {
			return <span className="text-orange-500">Wysłano po terminie</span>;
		}

		return <span className="text-lime-700">Wysłano {submittedAtFormat.format(submission.sentAt)}</span>;
	};

	const handleSubmit = async () => {
		setIsUploading(true);
		let ref;
		let fileKey: string | null = null;

		if (answerFile) {
			try {
				ref = toast("Wysyłanie załącznika", { autoClose: false, isLoading: true, type: "info" });
				const uploadRes = await uploadFiles({
					files: [answerFile],
					endpoint: "attachment",
				});

				fileKey = uploadRes[0]!.key;
			} catch (e) {
				setIsUploading(false);
				//eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
				return toast.update(ref!, { autoClose: 3000, type: "error", isLoading: false, render: "Nie udało się wysłać zadania." });
			}

			toast.update(ref, { autoClose: 3000, isLoading: false, type: "success", render: "Plik został wysłany" });
		}

		ref = toast("Wysyłanie zadania", { autoClose: false, isLoading: true });

		const res = await fetch(`/assignments/submit`, {
			method: "POST",
			body: JSON.stringify({
				assignmentId: assignment.id,
				studentId: studentId,
				content: answerText,
				attachment: fileKey,
			}),
		});

		if (!res.ok) {
			setIsUploading(false);
			return toast.update(ref, { autoClose: 3000, type: "error", isLoading: false, render: "Nie udało się wysłać zadania." });
		}

		const { id } = (await res.json()) as { id: string };

		toast.update(ref, { render: "Zadanie wysłane", isLoading: false, type: "success", autoClose: 3000 });

		setIsUploading(false);
		setSubmission({
			id: parseInt(id),
			attachment: fileKey,
			content: answerText,
			sentAt: new Date(),
			graded: false,
			assignmentId: assignment.id,
			studentId: studentId,
		});
	};

	return (
		<>
			<div className="flex items-end justify-between border-b py-4">
				<div className="flex flex-col gap-1">
					<h2 className="border-l-4 border-accent pl-2 text-2xl font-bold">Zadanie - {assignment.name}</h2>
					<p className="max-w-3xl font-light text-text/80">{assignment.description}</p>
				</div>
				<AssignmentStatus />
			</div>

			<div className="mt-4 grid h-[200px] grid-cols-[300px,2px,auto] gap-4 ">
				<div>
					<label className="font-medium" htmlFor="attachment">
						Twoja praca{assignment.fileRequired ? " (wymagana)" : ""}
					</label>
					<div
						className="relative mt-2 flex h-[200px] w-[300px] flex-col items-center justify-center gap-2 rounded-lg border bg-secondary/10 p-2 text-center"
						style={{
							cursor: isUploading || !!submission ? "cursor" : "pointer",
						}}
						onDrop={(e) => {
							e.preventDefault();
							if (!!submission) return;
							//If supported use getAsFile
							const file = e.dataTransfer.items ? e.dataTransfer.items[0]?.getAsFile() : e.dataTransfer.files[0];

							if (!file) return toast("Nie udało się załadować pliku", { type: "error", autoClose: 3000 });
							setAnswerFile(file);
						}}
						onClick={() => uploadRef.current?.click()}
						onDragOver={(e) => e.preventDefault()}
					>
						{!submission && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setAnswerFile(undefined);
								}}
							>
								<XMarkIcon className="absolute right-2 top-2 h-5 w-5" />
							</button>
						)}

						{!submission && <ArrowUpTrayIcon className="h-10 w-10" />}
						<AttachmentDisplay attachment={submission?.attachment ?? answerFile} />
					</div>
					<input
						disabled={isUploading || !!submission}
						id="attachment"
						type="file"
						hidden
						accept=".pdf,.doc,.docx,.odt,.zip,.pptx,.ppt,text/*,image/*,video/*"
						onChange={(e) => setAnswerFile(e.target.files![0])}
						ref={uploadRef}
					/>
					{!!submission && (
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
						Twoja odpowiedź
					</label>
					<textarea
						className="mt-2 w-full resize-none overflow-auto rounded-lg border bg-secondary/10 p-2 text-text focus:border-blue-500 focus:ring-blue-500"
						placeholder="Tu wpisz swoją odpowiedź"
						id="answer"
						rows={10}
						value={submission?.content ?? answerText}
						disabled={isUploading || !!submission}
						onChange={(e) => setAnswerText(e.target.value)}
					/>
				</div>
			</div>
		</>
	);
}

const AttachmentDisplay = ({ attachment }: { attachment: File | string | undefined }) => {
	if (typeof attachment === "string") {
		const isAttachmentImage = attachment.endsWith(".png") || attachment.endsWith(".jpg") || attachment.endsWith(".jpeg");

		if (isAttachmentImage) return <img src={`https://utfs.io/f/${attachment}`} className="h-full w-full rounded-lg object-cover" />;
		return `Plik typu .${attachment.split(".").pop()}`;
	}

	// File type
	if (typeof attachment !== "undefined") return <span className="truncate">{attachment.name}</span>;
	return "Kliknij tutaj lub przeciągnij i upuść plik, aby go załączyć.";
};
