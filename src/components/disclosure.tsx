"use client";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

export default function DisclosureButton({ icon, name, subNames }: DisclosureInteface) {
	const [open, setOpen] = useState(false);

	const openChange = () => {
		setOpen(!open);
	};

	return (
		<Disclosure>
			<Disclosure.Button
				as="div"
				className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-secondary/20"
				onClick={openChange}
			>
				<div className="flex items-center gap-2">
					{icon}
					<span className="text-base">{name}</span>
				</div>
				<ChevronUpIcon className={`transition-transform ${open ? "rotate-180 transform " : ""} h-5 w-5 text-accent`} />
			</Disclosure.Button>
			{subNames.map((item) => (
				<Link href={item.link} key={item.name}>
					<Transition
						enter="transition duration-100 ease-out"
						enterFrom="transform scale-95 opacity-0"
						enterTo="transform scale-100 opacity-100"
						leave="transition duration-75 ease-out"
						leaveFrom="transform scale-100 opacity-100"
						leaveTo="transform scale-95 opacity-0"
					>
						<Disclosure.Panel
							unmount
							as="div"
							className="ml-5 rounded-br-lg rounded-tr-lg border-l-2 bg-secondary/10 px-3 py-2 transition-colors hover:border-accent"
							key={item.name}
						>
							<span>{item.name}</span>
						</Disclosure.Panel>
					</Transition>
				</Link>
			))}
		</Disclosure>
	);
}

interface DisclosureInteface {
	icon: JSX.Element;
	name: string;
	subNames: {
		name: string;
		link: string;
	}[];
}
