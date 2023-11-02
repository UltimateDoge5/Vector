import Link from "next/link";
import type { AssignmentDto, SubmissionDto } from "~/types/dtos";

const dateFormat = Intl.DateTimeFormat("pl-PL", {
	day: "numeric",
	month: "short",
});

const submittedAtFormat = new Intl.DateTimeFormat("pl-PL", {
	year: "numeric",
	month: "long",
	day: "numeric",
	hour: "numeric",
	minute: "numeric",
});

export function AssignmentsListView({ assignments, submissions }: { assignments: AssignmentDto[]; submissions: SubmissionDto[] }) {
	return (
		<div className="flex w-full flex-col rounded-lg">
			<h2 className="mb-3 border-l-4 border-accent pl-2 text-2xl font-bold">Zadania</h2>

			<div className="flex flex-col gap-2">
				{assignments.map((assignment) => {
					const nameId = assignment.name.replace(/\s/g, "-").toLowerCase();
					const submission = submissions.find((s) => s.assignmentId === assignment.id);

					if (submission) return <SubmittedAssignment key={assignment.id} assignment={assignment} submission={submission} />;

					return (
						<Link
							href={`assignments/${nameId}-${assignment.id}`}
							key={assignment.id}
							className="grid w-full max-w-5xl grid-cols-[96px,auto] gap-4 rounded-lg border bg-slate-50 px-4 py-2 shadow-sm transition-all hover:brightness-[103%]"
						>
							<div className="flex gap-1 rounded bg-accent/20">
								<div
									className="w-6 rounded-l py-1 text-center text-text"
									style={{
										background: `hsl(${getAccentHue(assignment.creationDate!, assignment.dueDate)},80%,80%)`,
										textOrientation: "sideways",
										writingMode: "sideways-lr",
									}}
								>
									{capitalize(getDaysLeft(assignment.dueDate))}
								</div>

								<div className="flex flex-col justify-center gap-1 p-2 text-center">
									<span className="text-lg">{dateFormat.format(assignment.dueDate)}</span>
									<span className="font-light">{assignment.dueDate.getFullYear()}</span>
								</div>
							</div>
							<div className="w-3/5">
								<h3 className="text-xl font-medium">{assignment.name}</h3>
								<p className="text-ellipsis text-text/80">{assignment.description}</p>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

function SubmittedAssignment({ assignment, submission }: { assignment: AssignmentDto; submission: SubmissionDto }) {
	return (
		<Link
			href={`/assignments/${assignment.name.replace(/\s/g, "-").toLowerCase()}-${assignment.id}`}
			className="relative grid w-full max-w-5xl gap-4 rounded-lg border bg-slate-50 px-4 py-2 shadow-sm transition-all hover:brightness-[103%]"
		>
			<div className="w-3/5">
				<h3 className="text-xl font-medium">{assignment.name}</h3>
				<p className="text-ellipsis text-text/80">{assignment.description}</p>
			</div>

			<span className="absolute right-4 top-2 w-fit rounded-lg bg-lime-200/80 px-2 py-1 text-lime-700">
				Wysłano {submittedAtFormat.format(submission.sentAt)}
			</span>
		</Link>
	);
}

const getDaysLeft = (dueDate: Date) => {
	const timeLeft = dueDate.getTime() - Date.now();
	const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

	const formatter = new Intl.RelativeTimeFormat("pl-PL", {
		style: "narrow",
	});

	if (daysLeft === 0) {
		return "Dzisiaj";
	} else if (daysLeft === 1) {
		return "Jutro";
	} else if (daysLeft <= -1) {
		return "Zaległe";
	} else if (daysLeft < 7) {
		return formatter.format(daysLeft, "day");
	} else {
		return formatter.format(Math.ceil(daysLeft / 7), "week");
	}
};
const capitalize = (str: string) => (str[0] ?? "").toUpperCase() + str.slice(1);

// Calculate the % of time that has passed since the creation date to the due date
const getAccentHue = (creationDate: Date, dueDate: Date) => {
	const timePassed = Date.now() - creationDate.getTime();
	const totalTime = dueDate.getTime() - creationDate.getTime();
	const percent = timePassed / totalTime;

	// If the assignment is overdue, return red hue
	if (percent > 1) return 0;

	// Calculate the hue of the color
	return 120 - 120 * percent;
};
