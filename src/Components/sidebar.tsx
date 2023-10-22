import Link from "next/link";
import { HomeIcon, AcademicCapIcon, CheckBadgeIcon, TableCellsIcon, PencilSquareIcon, UsersIcon } from "@heroicons/react/24/outline";
import { type JSX } from "react";
import { currentUser } from "@clerk/nextjs";
import DisclosureButton from "./disclosure";

export async function Sidebar() {
    const user = await currentUser();

    const role = user?.privateMetadata.role ?? "student";

    return (
        <aside className="w-60 px-5">
            <div className="flex flex-col gap-y-1">
                <SidebarItem name="Home" icon={<HomeIcon className="h-5 w-5" />} link="/" />
                <SidebarItem name="Oceny" icon={<AcademicCapIcon className="h-5 w-5" />} link="/grades" />
                <SidebarItem name="Frekwencja" icon={<CheckBadgeIcon className="h-5 w-5" />} link="/presence" />
                <SidebarItem name="Plan zajęć" icon={<TableCellsIcon className="h-5 w-5" />} link="/schedule" />
                <SidebarItem name="Zadania" icon={<PencilSquareIcon className="h-5 w-5" />} link="/assignments" />
            </div>
            {role != "student" ? (
                <div className="mt-2 flex flex-col gap-y-1 border-t-2 pt-2">
                    <DisclosureButton
                        name="Użytkownicy"
                        icon={<UsersIcon className="h-5 w-5" />}
                        subNames={[
                            { name: "Uczniowie", link: "/students" },
                            { name: "Nauczyciele", link: "/teachers" },
                        ]}
                    />
                </div>
            ) : (
                <></>
            )}
        </aside>
    );
}

export function SidebarItem(props: { link: string; icon: JSX.Element; name: string }) {
    return (
        <Link href={props.link}>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-secondary/20">
                {props.icon}
                <span className="text-base">{props.name}</span>
            </div>
        </Link>
    );
}