"use client";
import { type ColumnDef, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";

export const DataTable = <TData, TValue>({
	data,
	columns,
	noDataText,
	title,
	description,
	primaryActionBtn,
	noHeader,
}: DataTableProps<TData, TValue>) => {
	const table = useReactTable({
		data,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<>
			{!noHeader && (
			<div className="flex items-end justify-between py-4">
				<div className="flex flex-col gap-1">
					<h2 className="border-l-4 border-accent pl-2 text-2xl font-bold">{title}</h2>
					{description && <p className="font-light text-text/80">{description}</p>}
				</div>
				{primaryActionBtn && <>{primaryActionBtn}</>}
			</div>)}
			<div className="w-full rounded-lg">
				<table className="w-full text-sm">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="mb-2 border-y py-2">
								{headerGroup.headers.map((header) => {
									return (
										<th key={header.id} className="h-12 px-4 text-left align-middle font-semibold">
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="transition-colors hover:bg-secondary/10"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td colSpan={columns.length} className="h-24 text-center font-medium">
									{noDataText}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</>
	);
};

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	noDataText: string;
	data: TData[];
	title: string;
	description?: string;
	primaryActionBtn?: JSX.Element;
	noHeader?: boolean;
}
