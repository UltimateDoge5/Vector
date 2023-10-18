'use client'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState } from 'react'


export default function DisclosureButton({icon, name, subNames}: DisclosureInteface){
    const [open, setOpen] = useState(false)

    const openChange = () => {
        setOpen(!open)
    }


    return (
        <Disclosure>
            <Disclosure.Button as="div" className="flex items-center gap-3 py-2 px-3 hover:bg-secondary/20 transition-colors rounded-lg cursor-pointer" onClick={openChange}>
                {icon}
                <span className="text-base">{name}</span>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-purple-500`}
                />
            </Disclosure.Button>
            {subNames.map((item) => 
                <Link href={`${item.link}`}>
                    <Disclosure.Panel as='div' className="flex items-center gap-3 py-2 ml-5 px-3 bg-secondary/10 transition-colors border-l-2 hover:border-purple-500 rounded-tr-lg rounded-br-lg cursor-pointer" key={item.name}>
                            <span>{item.name}</span>
                    </Disclosure.Panel>
                </Link>
            )}
        </Disclosure>
    )
}

interface DisclosureInteface {
    icon: JSX.Element,
    name: string,
    subNames: {
        name: string,
        link: string
    }[]
}