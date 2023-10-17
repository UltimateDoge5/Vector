import Link from "next/link"
import {HomeIcon, AcademicCapIcon, CheckBadgeIcon, TableCellsIcon, PencilSquareIcon} from '@heroicons/react/24/outline'
import { JSX } from "react";
import { UrlObject } from "url";

export default function Sidebar(){
    return (
        <aside className="w-[300px] px-5">
            <div className="flex flex-col gap-y-1">
                <SidebarItem name="Home" icon={<HomeIcon className="h-5 w-5"/>} link="/"/>
                <SidebarItem name="Oceny" icon={<AcademicCapIcon className="h-5 w-5"/>} link="/grades"/>
                <SidebarItem name="Frekwencja" icon={<CheckBadgeIcon className="h-5 w-5"/>} link="/presence"/>
                <SidebarItem name="Plan zajęć" icon={<TableCellsIcon className="h-5 w-5"/>} link="/schedule"/>
                <SidebarItem name="Zadania" icon={<PencilSquareIcon className="h-5 w-5"/>} link="/assignments"/>

            </div>
        </aside>
    );
}

export function SidebarItem(props: { link: string; icon: JSX.Element; name: string; }){
    return (
        <Link href={props.link}>
            <div className="flex items-center gap-3 py-2 px-3 hover:bg-secondary/20 transition-colors rounded-lg">
                {props.icon}
                <span className="text-base">{props.name}</span>
            </div>
        </Link>
    )
    
}