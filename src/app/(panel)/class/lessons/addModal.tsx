"use client"

import { Combobox, Transition } from "@headlessui/react"
import { ChevronUpDownIcon } from "@heroicons/react/24/outline"
import { Fragment, useMemo, useState } from "react"
import { toast } from "react-toastify"
import { ActionModal } from "~/components/ui/modal"
import { type LessonDto, type TeacherDto } from "~/types/dtos"

interface Props {
    open: boolean,
    setOpen: (state: boolean) => void,
    lessons: LessonDto[],
    teachers: TeacherDto[],
    add: (teacherId: number, lessonId: number) => void
}

export default function AddModal({ open, setOpen, lessons, teachers, add }: Props) {
    const [selectedLesson, setSelectedLesson] = useState<LessonDto | null>(null);
    const [lessonQuery, setLessonQuery] = useState('')

    const [selectedTeacher, setSelectedTeacher] = useState<LessonDto | null>(null);
    const [teacherQuery, setTeacherQuery] = useState('')

    const filteredLessons = useMemo(
        () => lessonQuery === ''
            ? lessons
            : lessons.filter((lesson) =>
                lesson.name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(lessonQuery.toLowerCase().replace(/\s+/g, ''))
            ), [lessonQuery, lessons]);

    const filteredTeachers = useMemo(
        () => teacherQuery === ''
            ? teachers
            : teachers.filter((teacher) =>
                teacher.name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(teacherQuery.toLowerCase().replace(/\s+/g, ''))
            ), [teacherQuery, teachers]);

    const onConfirm = () => {
        if (!selectedLesson || !selectedTeacher) {
            return toast("Wypełnij poprawnie formularz", { autoClose: 3000, position: "bottom-center", type: "error" });
        }

        add(selectedTeacher.id, selectedLesson.id);

        setSelectedTeacher(null);
        setSelectedLesson(null);
    }

    return (
        <ActionModal
            open={open}
            setOpen={setOpen}
            dismissible={true}
            title={"Dodaj przedmiot"}
            actionText={"Dodaj"}
            icon={false}
            onConfirm={onConfirm}
            colors={{
                accent: "bg-accent/20 text-accent",
                button: "bg-primary text-text hover:bg-primary/90"
            }}
        >
            <form>
                <span className="mt-4 font-medium">Przedmiot</span>
                <Combobox value={selectedLesson} onChange={setSelectedLesson}>
                    <div className="relative mt-1">
                        <Combobox.Input
                            className="w-full bg-secondary/60 rounded-lg outline-none text-text flex-1 px-4 py-2"
                            displayValue={(lesson: LessonDto | null) => lesson ? lesson.name : ""}
                            onChange={(event) => setLessonQuery(event.target.value)}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setLessonQuery('')}
                        >
                            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20">
                                {filteredLessons.length === 0 && lessonQuery !== '' ? (
                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                        Nie znaleziono przedmiotu
                                    </div>
                                ) : (
                                    filteredLessons.map((lesson) => (
                                        <Combobox.Option
                                            key={lesson.id}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-accent/50 text-white' : 'text-text'
                                                }`
                                            }
                                            value={lesson}
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span
                                                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                            }`}
                                                    >
                                                        {lesson.name}
                                                    </span>
                                                </>
                                            )}
                                        </Combobox.Option>
                                    ))
                                )}
                            </Combobox.Options>
                        </Transition>
                    </div>
                </Combobox>

                <span className="mt-4 font-medium">Nauczyciel</span>
                <Combobox value={selectedTeacher} onChange={setSelectedTeacher}>
                    <div className="relative mt-1">
                        <Combobox.Input
                            className="w-full bg-secondary/60 rounded-lg outline-none text-text flex-1 px-4 py-2"
                            displayValue={(teacher: TeacherDto | null) => teacher ? teacher.name : ""}
                            onChange={(event) => setTeacherQuery(event.target.value)}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setTeacherQuery('')}
                        >
                            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20">
                                {filteredTeachers.length === 0 && teacherQuery !== '' ? (
                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                        Nie znaleziono nauczyciela
                                    </div>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <Combobox.Option
                                            key={teacher.id}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-accent/50 text-white' : 'text-text'
                                                }`
                                            }
                                            value={teacher}
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span
                                                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                            }`}
                                                    >
                                                        {teacher.name}
                                                    </span>
                                                </>
                                            )}
                                        </Combobox.Option>
                                    ))
                                )}
                            </Combobox.Options>
                        </Transition>
                    </div>
                </Combobox>
            </form>
        </ActionModal>
    )
}