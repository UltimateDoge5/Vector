"use client";
import { Disclosure } from "@headlessui/react";
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
				className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-secondary/20"
				onClick={openChange}
			>
				{icon}
				<span className="text-base">{name}</span>
				<ChevronUpIcon className={`${open ? "rotate-180 transform" : ""} h-5 w-5 text-purple-500`} />
			</Disclosure.Button>
			{subNames.map((item) => (
				<Link href={item.link} key={item.name}>
					<Disclosure.Panel
						as="div"
						className="ml-5 flex cursor-pointer items-center gap-3 rounded-br-lg rounded-tr-lg border-l-2 bg-secondary/10 px-3 py-2 transition-colors hover:border-purple-500"
						key={item.name}
					>
						<span>{item.name}</span>
					</Disclosure.Panel>
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
