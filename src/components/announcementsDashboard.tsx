"use client";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { type Announcements } from "~/server/db/schema";

const dateFormat = Intl.DateTimeFormat("pl", { day: "numeric", month: "long", year: "numeric" });

export default function AnnouncementsDashboard({ announcements }: { announcements: IAnnouncements[] }) {
	return (
		<div className="w-full px-4">
			<div className="flex w-full flex-col gap-2 rounded-2xl bg-white p-3 h-52">
				<h1 className="pb border-b pl-3 text-lg font-medium">Ogłoszenia</h1>
				
				<div className="overflow-auto flex w-full flex-col gap-2 ">
				
				{announcements.map((announcementItem) => (
					<Disclosure key={announcementItem.id}>
						{({ open }) => (
							<>
								<Disclosure.Button className="flex w-full justify-between rounded-lg bg-secondary/80 px-4 py-2 text-left text-sm font-medium hover:bg-secondary focus:outline-none">
									<div className="flex w-full flex-row justify-between pr-7">
										<span className="text-ellipsis">{announcementItem.name}</span>
										<span className="font-light">{dateFormat.format(announcementItem.date)}</span>
									</div>
									<ChevronUpIcon className={`${open ? "rotate-180 transform" : ""} h-5 w-5 font-extrabold text-accent`} />
								</Disclosure.Button>
								<Transition
									enter="transition-opacity duration-75"
									enterFrom="opacity-0"
									enterTo="opacity-100"
									leave="transition-opacity duration-150"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<Disclosure.Panel className="px-4 py-2 text-sm text-text">
										{announcementItem.description}
									</Disclosure.Panel>
								</Transition>
							</>
						)}
					</Disclosure>
				))}
				</div>
			</div>
		</div>
	);
}

type IAnnouncements = typeof Announcements.$inferSelect;
