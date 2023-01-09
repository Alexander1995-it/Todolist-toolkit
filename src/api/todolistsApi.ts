import axios, {AxiosResponse} from "axios";


const incstanse = axios.create({
    baseURL: 'https://social-network.samuraijs.com/api/1.1/',
    withCredentials: true,
    headers: {
        'API-KEY': 'da9cb287-f4c3-4451-9409-0a992045ae44'
    }
})

export const todolistsAPI = {
    getTodolists() {
        return incstanse.get<TodolistType[]>('todo-lists')
    },
    deleteTodolists(todoListID: string) {
        return incstanse.delete<ResponseType>(`todo-lists/${todoListID}`)
    },
    addTodolist(title: string) {
        return incstanse.post<{ title: string }, AxiosResponse<ResponseType<{ item: TodolistType }>>>('todo-lists', {title})
    }
}

export const tasksAPI = {
    getTasks(todolistId: string) {
        return incstanse.get(`todo-lists/${todolistId}/tasks`)
    },
    addTask(todolistId: string, title: string) {
        return incstanse.post<{ title: string }, AxiosResponse<ResponseType<{ item: TaskType }>>>(`todo-lists/${todolistId}/tasks`, {title})
    },
    removeTask(todolistId: string, taskId: string) {
        return incstanse.delete<ResponseType>(`/todo-lists/${todolistId}/tasks/${taskId}`)
    },
    updateTask(todolistId: string, taskId: string, model: UpdateTaskModelType) {
        return incstanse.put<UpdateTaskModelType, AxiosResponse<ResponseType<{ item: TaskType }>>>(`todo-lists/${todolistId}/tasks/${taskId}`, model)
    }
}

export const authApi = {
    authMe() {
        return incstanse.get<ResponseType<AuthMeResponse>>('auth/me')
    },
    login(data: LoginRequestType) {
        return incstanse.post<LoginRequestType, AxiosResponse<ResponseType<{userId: number}>>>('auth/login', data)
    }, logout () {
        return incstanse.delete<ResponseType>('auth/login')
    }
}

//enum
export enum TaskStatuses {
    New = 0,
    InProgress = 1,
    Completed = 2,
    Draft = 3
}

export enum TaskPriorities {
    Low = 0,
    Middle = 1,
    Hi = 2,
    Urgently = 3,
    Later = 4
}

export enum ResponseResultCode {
    OK = 0,
    ERROR = 1
}


//typesCommon
export type ResponseType<D = {}> = {
    resultCode: number
    messages: Array<string>
    fieldsErrors: Array<string>
    data: D
}

//typesTask
export type TaskType = {
    description: string
    title: string
    status: TaskStatuses
    priority: number
    startDate: string
    deadline: string
    id: string
    todoListId: string
    order: number
    addedDate: string
}

export type UpdateTaskModelType = {
    title: string
    description: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
}


//typesTodolist
export type TodolistType = {
    id: string
    title: string
    addedDate: string
    order: number
}

//typesAuth
export type AuthMeResponse = {
    email: string
    id: number
    login: string
}

export type LoginRequestType = {
    email: string
    password: string
    rememberMe: boolean
    captcha?: boolean
}


