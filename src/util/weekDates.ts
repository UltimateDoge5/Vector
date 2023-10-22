export const getWeekDates = (weekDate?: string) => {
	const week = {
		from: new Date(),
		to: new Date(),
	};

	// Get the first and last day of the week
	const date = weekDate ? new Date(weekDate) : new Date();
	const day = date.getDay();
	const diff = date.getDate() - day + (day == 0 ? -6 : 1);

	week.from = new Date(date.setDate(diff));
	week.from.setHours(0, 0, 0); // Set the time to 00:00:00, exemptions are stored whith the same time
	week.to = new Date(date.setDate(diff + 6));
	week.to.setHours(0, 0, 0);

	return week;
};
