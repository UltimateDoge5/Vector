import Link from "next/link";
import { AssignmentDto, SubmissionDto } from "~/types/dtos";

const dateFormat = Intl.DateTimeFormat("pl-PL", {
	day: "numeric",
	month: "short",
	hour: "numeric",
	minute: "numeric",
});

export function TeacherView({
	assignments,
	classSize,
	submissionCount,
}: {
	assignments: AssignmentDto[];
	submissionCount: {
		count: number;
		assignmentId: number;
	}[];
	classSize: number;
}) {
	return (
		<div className="flex w-full flex-col rounded-lg">
			<h2 className="mb-3 border-l-4 border-accent pl-2 text-2xl font-bold">Zadania</h2>

			<div className="flex flex-col gap-2">
				{assignments.map((assignment) => {
					const nameId = assignment.name.replace(/\s/g, "-").toLowerCase();
					const submissions = submissionCount.find((s) => s.assignmentId === assignment.id)?.count ?? 0;

					return (
						<Link
							key={assignment.id}
							href={`/assignments/${nameId}-${assignment.id}`}
							className="relative grid w-full max-w-5xl gap-4 rounded-lg border bg-slate-50 px-4 py-2 shadow-sm transition-all hover:brightness-[103%]"
						>
							<div className="w-3/5">
								<h3 className="text-xl font-medium">{assignment.name}</h3>
								<p className="text-ellipsis text-text/80">{assignment.description}</p>
							</div>
							<span className="absolute right-4 top-2 flex w-fit items-center gap-2 rounded-lg px-2 py-1">
								Termin oddania: {dateFormat.format(assignment.dueDate)}
							</span>
							<span className="absolute bottom-2 right-4 flex w-1/5 items-center gap-2 rounded-lg px-2 py-1">
								<ProgressBar progress={(submissions / classSize) * 100} />
								{submissions}/{classSize}
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

function ProgressBar({ progress }: { progress: number }) {
	return (
		<div className="relative h-2 w-full rounded-lg bg-accent/20">
			<div className="absolute left-0 top-0 h-full rounded-lg bg-accent" style={{ width: `${progress}%` }} />
		</div>
	);
}
