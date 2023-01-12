import React from 'react';
import {tasksAPI, TaskStatuses, TaskType, UpdateTaskModelType} from "../api/todolistsApi";
import {AppActionType, AppRootStateType, AppThunk} from "../store/store";
import {setAppError, setAppStatus} from "./appReducer";
import axios, {AxiosError} from "axios/index";
import {handlerServerAppError} from "../common/utils/errorUtils";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {addTodoListAC, removeTodoListAC, setTodolistsAC} from "./todoListsReducer";

const initialState: TasksStateType = {}

const slice = createSlice({
    name: 'tasks',
    initialState: initialState,
    reducers: {
        setTasksAC(state, action: PayloadAction<{ todolistId: string, tasks: TaskType[] }>) {
            state[action.payload.todolistId] = action.payload.tasks
        },
        addTaskAC(state, action: PayloadAction<{ todolistId: string, task: TaskType }>) {
            state[action.payload.todolistId].unshift(action.payload.task)
        },
        removeTaskAC(state, action: PayloadAction<{ todolistId: string, taskId: string }>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(task => task.id === action.payload.taskId)
            tasks.splice(index, 1)
        },
        updateTaskAC(state, action: PayloadAction<{ todolistId: string, taskId: string, model: UpdateTaskModelType }>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(task => task.id === action.payload.taskId)
            tasks[index] = {...tasks[index], ...action.payload.model}
        }
    },
    extraReducers: (builder) => {
        builder.addCase(addTodoListAC, (state, action) => {
            state[action.payload.newTodolist.id] = []
        })
        builder.addCase(removeTodoListAC, (state, action) => {
            delete state[action.payload.todolistID]
        })
        builder.addCase(setTodolistsAC, (state, action) => {
            action.payload.todolists.forEach(todolist => {
                state[todolist.id] = []
            })
        })
    }
})

export const tasksReducer = slice.reducer
export const {updateTaskAC, removeTaskAC, setTasksAC, addTaskAC} = slice.actions

//thunks
export const fetchTasksTC = (todolistId: string): AppThunk => async (dispatch) => {
    try {
        let response = await tasksAPI.getTasks(todolistId)
        dispatch(setTasksAC({todolistId, tasks: response.data.items}))
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            dispatch(setAppError({error}))
        }
    }

}
export const createTaskTC = (todolistId: string, title: string): AppThunk => async (dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    try {
        const response = await tasksAPI.addTask(todolistId, title)
        const task = response.data.data.item
        if (response.data.resultCode === 0) {
            dispatch(addTaskAC({todolistId, task}))
        } else {
            handlerServerAppError(dispatch, response.data)
        }
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            dispatch(setAppError({error}))
        }

    } finally {
        dispatch(setAppStatus({status: 'succeeded'}))
    }

}

export const removeTaskTC = (todolistId: string, taskId: string): AppThunk => async (dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    try {
        const response = await tasksAPI.removeTask(todolistId, taskId)
        if (response.data.resultCode === 0) {
            dispatch(removeTaskAC({todolistId, taskId}))
        } else {
            if (response.data.messages.length) {
                dispatch(setAppError({error: response.data.messages[0]}))
            } else {
                dispatch(setAppError({error: 'Some error'}))
            }
        }
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            dispatch(setAppError({error}))
        }
    } finally {
        dispatch(setAppStatus({status: 'succeeded'}))
    }

}

export const updateStatusTC = (todolistId: string, taskId: string, status: TaskStatuses): AppThunk => async (dispatch, getState: () => AppRootStateType) => {

    dispatch(setAppStatus({status: 'loading'}))

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
        try {
            const response = await tasksAPI.updateTask(todolistId, taskId, model)
            if (response.data.resultCode === ResponseStatusCode.success) {
                dispatch(updateTaskAC({todolistId, taskId, model}))
            } else {
                if (response.data.messages.length) {
                    dispatch(setAppError({error: response.data.messages[0]}))
                } else {
                    dispatch(setAppError({error: 'Some error'}))
                }
            }
        } catch (e) {
            let err = e as AxiosError | Error
            if (axios.isAxiosError(err)) {
                const error = err.response?.data
                    ? (err.response.data as { error: string }).error
                    : err.message
                dispatch(setAppError({error}))
            }
        } finally {
            dispatch(setAppStatus({status: 'succeeded'}))
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
        dispatch(setAppStatus({status: 'loading'}))
        try {
            const response = await tasksAPI.updateTask(todolistId, taskId, model)
            if (response.data.resultCode === ResponseStatusCode.success) {
                dispatch(updateTaskAC({todolistId, taskId, model}))
            } else {
                if (response.data.messages.length) {
                    dispatch(setAppError({error: response.data.messages[0]}))
                } else {
                    dispatch(setAppError({error: 'Some error'}))
                }
            }
        } catch (e) {
            let err = e as AxiosError | Error
            if (axios.isAxiosError(err)) {
                const error = err.response?.data
                    ? (err.response.data as { error: string }).error
                    : err.message
                dispatch(setAppError({error}))
            }
        } finally {
            dispatch(setAppStatus({status: 'succeeded'}))
        }
    }
}


// enum
enum ResponseStatusCode {
    success = 0,
    error = 1,
    captcha = 10
}

// types
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

export type TasksActionType =
    | ReturnType<typeof setTasksAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof updateTaskAC>


