"use client";
import { type IAssignment } from "~/app/(panel)/assignments/view";
import { type Submission } from "~/server/db/schema";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { uploadFiles } from "~/util/uploadHelpers";

export function AssignmentView({
	assignment,
	submission,
	studentId,
}: {
	assignment: IAssignment;
	submission: ISubmission | undefined;
	studentId: number;
}) {
	const [answerFile, setAnswerFile] = useState<File | undefined>(undefined);
	const [answerText, setAnswerText] = useState("");

	const uploadRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const handleSubmit = async () => {
		setIsUploading(true);

		let ref = toast("Wysyłanie zadania", { autoClose: false, isLoading: true });
		const res = await fetch(`/assignments/submit`, {
			method: "POST",
			body: JSON.stringify({
				assignmentId: assignment.id,
				studentId: studentId,
				content: answerText,
			}),
		});

		if (!res.ok){
			setIsUploading(false)
			return toast.update(ref, { autoClose: 3000, type: "error", isLoading: false, render: "Nie udało się wysłać zadania." });
		}

		const { id } = (await res.json()) as { id: string };

		toast.update(ref, { render: "Zadanie wysłane", isLoading: false, type: "success",autoClose: 3000 });
		if (!answerFile) return setIsUploading(false);

		ref = toast("Wysyłanie załącznika", { autoClose: false, isLoading: true, type: "info" });

		await uploadFiles({
			files: [answerFile],
			endpoint: "attachment",
			input: {
				submissionId: parseInt(id),
			},
		});

		toast.update(ref, { autoClose: 3000, isLoading: false, type: "success", render: "Plik został wysłany" });
		setIsUploading(false);
	};

	return (
		<>
			<div className="flex items-end justify-between border-b py-4">
				<div className="flex flex-col gap-1">
					<h2 className="border-l-4 border-accent pl-2 text-2xl font-bold">Zadanie - {assignment.name}</h2>
					<p className="max-w-3xl font-light text-text/80">{assignment.description}</p>
				</div>
				<Button disabled={isUploading || !answerFile} loading={isUploading} onClick={handleSubmit}>
					Wyślij rozwiązanie
				</Button>
			</div>

			<div className="ser mt-4 grid h-[200px] grid-cols-[300px,2px,auto] gap-4 ">
				<div>
					<label className="font-medium">Twoja praca</label>
					<div
						className="relative mt-1 flex h-[200px] w-[300px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-secondary/10 p-2 text-center"
						onDrop={(e) => {
							e.preventDefault();

							//If supported use getAsFile
							const file = e.dataTransfer.items ? e.dataTransfer.items[0]?.getAsFile() : e.dataTransfer.files[0];

							if (!file) return toast("Nie udało się załadować pliku", { type: "error" });
							setAnswerFile(file);
						}}
						onClick={() => uploadRef.current?.click()}
						onDragOver={(e) => e.preventDefault()}
					>
						{answerFile && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setAnswerFile(undefined);
								}}
							>
								<XMarkIcon className="absolute right-2 top-2 h-5 w-5" />
							</button>
						)}

						<ArrowUpTrayIcon className="h-10 w-10" />
						{!answerFile ? "Kliknij tutaj lub przeciągnij i upuść plik, aby go załączyć." : answerFile.name}
					</div>
					<input
						disabled={isUploading}
						id="image"
						name="image"
						type="file"
						hidden
						accept=".pdf,.doc,.docx,.odt,.zip,.pptx,.ppt,text/*,image/*,video/*"
						onChange={(e) => setAnswerFile(e.target.files![0])}
						ref={uploadRef}
					/>
				</div>
				<div className="w-[2px] bg-accent/20 mt-7" />
				<div>
					<label className="font-medium">Twoja odpowiedź</label>
					<textarea
						className="mt-1 w-full resize-none overflow-auto rounded-lg border bg-secondary/10 p-2 text-text focus:border-blue-500 focus:ring-blue-500"
						placeholder="Odpowiedź"
						rows={10}
						value={answerText}
						onChange={(e) => setAnswerText(e.target.value)}
					/>
				</div>
			</div>
		</>
	);
}

type ISubmission = typeof Submission.$inferSelect;
