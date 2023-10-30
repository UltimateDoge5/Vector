"use client";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/ui/button";

export function ActionModal({
	open,
	setOpen,
	actionText,
	children,
	title,
	onConfirm,
	confirmDisabled,
	loading,
	colors,
	secondaryText,
	onDeny,
	dismissible,
	icon,
	titleClassName,
}: ActionModalProps) {
	const cancelButtonRef = useRef(null);

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog
				as="div"
				className="relative z-10"
				initialFocus={cancelButtonRef}
				onClose={() => {
					if (dismissible) setOpen(false);
				}}
				open={open}
			>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
				</Transition.Child>

				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
								<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
									<div className="sm:flex sm:items-start">
										{icon !== false && (
											<div
												className={twMerge(
													"mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 sm:mx-0 sm:h-10 sm:w-10",
													colors?.accent,
												)}
											>
												{icon ?? <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />}
											</div>
										)}
										<div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
											<Dialog.Title
												as="h3"
												className={twMerge("text-base font-semibold leading-6 text-gray-900", titleClassName)}
											>
												{title}
											</Dialog.Title>
											<div className="mt-2">{children}</div>
										</div>
									</div>
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
									<Button
										loading={loading}
										className={twMerge(
											"inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto",
											colors?.button,
										)}
										onClick={() => {
											onConfirm();
											if (!loading) setOpen(false);
										}}
										// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
										disabled={loading || confirmDisabled}
									>
										{actionText}
									</Button>
									<Button
										className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
										onClick={() => {
											onDeny?.();
											setOpen(false);
										}}
										ref={cancelButtonRef}
										disabled={loading}
									>
										{secondaryText ?? "Anuluj"}
									</Button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}

interface ActionModalProps {
	open: boolean;
	title: string;
	titleClassName?: string;
	actionText: string;
	children?: React.ReactNode;
	loading?: boolean;
	confirmDisabled?: boolean;
	onConfirm: () => void;
	onDeny?: () => void;
	secondaryText?: string;
	setOpen: (open: boolean) => void;
	dismissible?: boolean;
	icon?: JSX.Element | false;
	colors?: {
		button?: string;
		accent?: string;
	};
}
