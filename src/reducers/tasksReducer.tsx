import React from 'react';
import {tasksAPI, TaskStatuses, TaskType, UpdateTaskModelType} from "../api/todolistsApi";
import {AppActionType, AppRootStateType, AppThunk} from "../store/store";
import {setAppError, setAppStatus} from "./appReducer";
import axios, {AxiosError} from "axios/index";
import {handlerServerAppError} from "../common/utils/errorUtils";

const initialState: TasksStateType = {}


export const tasksReducer = (state: TasksStateType = initialState, action: AppActionType): TasksStateType => {
    switch (action.type) {
        case "SET_TASKS":
            return {
                ...state, [action.todolistId]: action.tasks
            }
        case 'ADD_TASK': {
            return {
                ...state,
                [action.payload.todolistId]: [action.payload.task, ...state[action.payload.todolistId]]
            }
        }
        case 'SET_TODOLISTS': {
            let copyState = {...state}
            action.todolists.forEach(t => {
                copyState[t.id] = []
            })
            return copyState
        }

        case 'ADD_TODOLIST': {
            return {...state, [action.newTitle.id]: []}
        }

        case 'REMOVE_TODOLIST': {
            const copyState = {...state}
            delete copyState[action.todolistID]
            return copyState
        }

        case 'REMOVE_TASK': {
            return {
                ...state,
                [action.payload.todolistId]: state[action.payload.todolistId].filter(el => el.id !== action.payload.taskId)
            }
        }

        case 'CHANGE_STATUS': {
            return {
                ...state,
                [action.payload.todolistId]: state[action.payload.todolistId].map(el => el.id === action.payload.taskId
                    ? {...el, ...action.payload.model}
                    : el)
            }
        }

        default:
            return state
    }
};

// types
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

export type TasksActionType =
    | ReturnType<typeof setTasksAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof changeStatusAC>

//actions
export const setTasksAC = (todolistId: string, tasks: TaskType[]) => ({type: 'SET_TASKS', todolistId, tasks} as const)
export const addTaskAC = (todolistId: string, task: TaskType) => ({
    type: 'ADD_TASK',
    payload: {todolistId, task}
} as const)

export const removeTaskAC = (todolistId: string, taskId: string) => {
    return {
        type: 'REMOVE_TASK',
        payload: {
            todolistId,
            taskId
        }
    } as const
}

export const changeStatusAC = (todolistId: string, taskId: string, model: UpdateTaskModelType) => {
    return {
        type: 'CHANGE_STATUS',
        payload: {
            todolistId,
            taskId,
            model
        }
    } as const
}

//thunks
export const fetchTasksTC = (todoListID: string): AppThunk => async (dispatch) => {
    try {
        let response = await tasksAPI.getTasks(todoListID)
        dispatch(setTasksAC(todoListID, response.data.items))
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            dispatch(setAppError(error))
        }
    }

}
export const createTaskTC = (todolistId: string, title: string): AppThunk => async (dispatch) => {
    dispatch(setAppStatus('loading'))
    try {
        const response = await tasksAPI.addTask(todolistId, title)
        const task = response.data.data.item
        if (response.data.resultCode === 0) {
            dispatch(addTaskAC(todolistId, task))
        } else {
            handlerServerAppError(dispatch, response.data)
        }
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            dispatch(setAppError(error))
        }

    } finally {
        dispatch(setAppStatus('succeeded'))
    }

}

export const removeTaskTC = (todolistId: string, taskId: string): AppThunk => async (dispatch) => {
    dispatch(setAppStatus('loading'))
    try {
        const response = await tasksAPI.removeTask(todolistId, taskId)
        if (response.data.resultCode === 0) {
            dispatch(removeTaskAC(todolistId, taskId))
        } else {
            if (response.data.messages.length) {
                dispatch(setAppError(response.data.messages[0]))
            } else {
                dispatch(setAppError('Some error'))
            }
        }
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            dispatch(setAppError(error))
        }
    } finally {
        dispatch(setAppStatus('succeeded'))
    }

}

export const updateStatusTC = (todolistId: string, taskId: string, status: TaskStatuses): AppThunk => async (dispatch, getState: () => AppRootStateType) => {
    const task = getState().tasks[todolistId].find(t => t.id === taskId)
    if (task) {
        const model: UpdateTaskModelType = {
            title: task.title,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            deadline: task.deadline,
            status
        }
        dispatch(setAppStatus('loading'))
        try {
            const response = await tasksAPI.updateTask(todolistId, taskId, model)
            if (response.data.resultCode === ResponseStatusCode.success) {
                dispatch(changeStatusAC(todolistId, taskId, model))
            } else {
                if (response.data.messages.length) {
                    dispatch(setAppError(response.data.messages[0]))
                } else {
                    dispatch(setAppError('Some error'))
                }
            }
        } catch (e) {
            let err = e as AxiosError | Error
            if (axios.isAxiosError(err)) {
                const error = err.response?.data
                    ? (err.response.data as { error: string }).error
                    : err.message
                dispatch(setAppError(error))
            }
        } finally {
            dispatch(setAppStatus('succeeded'))
        }

    }
}

export const updateTitleTC = (todolistId: string, taskId: string, title: string): AppThunk => async (dispatch, getState: () => AppRootStateType) => {
    const task = getState().tasks[todolistId].find(t => t.id === taskId)
    if (task) {
        const model: UpdateTaskModelType = {
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            deadline: task.deadline,
            status: task.status,
            title
        }
        dispatch(setAppStatus('loading'))
        try {
            const response = await tasksAPI.updateTask(todolistId, taskId, model)
            if (response.data.resultCode === ResponseStatusCode.success) {
                dispatch(changeStatusAC(todolistId, taskId, model))
            } else {
                if (response.data.messages.length) {
                    dispatch(setAppError(response.data.messages[0]))
                } else {
                    dispatch(setAppError('Some error'))
                }
            }
        } catch (e) {
            let err = e as AxiosError | Error
            if (axios.isAxiosError(err)) {
                const error = err.response?.data
                    ? (err.response.data as { error: string }).error
                    : err.message
                dispatch(setAppError(error))
            }
        } finally {
            dispatch(setAppStatus('succeeded'))
        }
    }
}


// enum
enum ResponseStatusCode {
    success = 0,
    error = 1,
    captcha = 10
}
