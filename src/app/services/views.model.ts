export interface View {
    id: number,
    name: string,
    slug: string,
    tasks?: Task[]
}

export interface SubTask {
    description: string,
    status: object,
    title: string
}

export interface Task {
    assignee: string,
    categoryId: number,
    completed_count: number,
    description: string,
    due_date: string,
    id: string,
    priority: string,
    status: {
        id: number,
        name: string,
        slug: string
    },
    sub_tasks: SubTask[],
    title: string,
    total_count: number
}