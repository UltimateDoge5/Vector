export interface TeacherDto {
    id: number,
    userId: string,
    name: string,
    admin: boolean | null,
}

export interface StudentDto {
    id: number,
    userId: string,
    name: string,
    class: ClassDto
}
  
export interface ClassDto {
    id: number,
    teacherId: number,
    name: string,
}