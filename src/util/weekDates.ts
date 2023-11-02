import dayjs from "dayjs";

export const getWeekDates = (weekDate?: string) => {
	const week = {
		from: new Date(),
		to: new Date(),
	};

	// Get the first and last day of the week
	week.from = dayjs(weekDate).day(1).set("h", 0).set("m", 0).set("s", 0).toDate();
	week.to = dayjs(weekDate).day(6).set("h", 0).set("m", 0).set("s", 0).toDate();

	return week;
};
