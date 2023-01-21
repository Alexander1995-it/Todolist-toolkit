import React from 'react';
import {TaskPriorities, tasksAPI, TaskStatuses, TaskType} from "../api/todolistsApi";
import {AppRootStateType} from "../store/store";
import {setAppError, setAppStatus} from "./appReducer";
import axios, {AxiosError} from "axios/index";
import {handlerServerAppError} from "../common/utils/errorUtils";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {addTodoListAC, fetchTodolistsTC, removeTodoListAC} from "./todoListsReducer";

const initialState: TasksStateType = {}

const slice = createSlice({
    name: 'tasks',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addTodoListAC, (state, action) => {
            state[action.payload.newTodolist.id] = []
        })
        builder.addCase(removeTodoListAC, (state, action) => {
            delete state[action.payload.todolistID]
        })
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            action.payload.todolists.forEach(todolist => {
                state[todolist.id] = []
            })
        })
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks
        })
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(task => task.id === action.payload.taskId)
            tasks.splice(index, 1)
        })
        builder.addCase(createTaskTC.fulfilled, (state, action) => {
            state[action.payload.todolistId].unshift(action.payload.task)
        })
        builder.addCase(updateTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(task => task.id === action.payload.taskId)
            tasks[index] = {...tasks[index], ...action.payload.model}
        })
    }
})

export const tasksReducer = slice.reducer
export const {} = slice.actions

export const updateTaskTC = createAsyncThunk('tasks/updateTitle', async (param: { todolistId: string, taskId: string, model: UpdateTaskModelType }, thunkAPI) => {
    const state = thunkAPI.getState() as AppRootStateType
    const task = state.tasks[param.todolistId].find(t => t.id === param.taskId)
    if (!task) {
        return thunkAPI.rejectWithValue({})
    }
    const model: UpdateTaskModelType = {
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        deadline: task.deadline,
        status: task.status,
        title: task.title,
        ...param.model
    }
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        const response = await tasksAPI.updateTask(param.todolistId, param.taskId, model)
        if (response.data.resultCode === ResponseStatusCode.success) {
            return {todolistId: param.todolistId, taskId: param.taskId, model}
        } else {
            if (response.data.messages.length) {
                thunkAPI.dispatch(setAppError({error: response.data.messages[0]}))
            } else {
                thunkAPI.dispatch(setAppError({error: 'Some error'}))
            }
            return thunkAPI.rejectWithValue({})
        }

    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            thunkAPI.dispatch(setAppError({error}))
        }
        return thunkAPI.rejectWithValue({})
    } finally {
        thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
    }
})


export const fetchTasksTC = createAsyncThunk('tasks/fetchTasks', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        let response = await tasksAPI.getTasks(todolistId)
        const tasks = response.data.items
        return {todolistId, tasks}
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            thunkAPI.dispatch(setAppError({error}))
        }
        return thunkAPI.rejectWithValue({})
    } finally {
        thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
    }
})

export const createTaskTC = createAsyncThunk('tasks/createTask', async (params: { todolistId: string, title: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        const response = await tasksAPI.addTask(params.todolistId, params.title)
        if (response.data.resultCode === 0) {
            console.log(thunkAPI.getState())
            const task = response.data.data.item
            return {todolistId: params.todolistId, task}
        } else {
            handlerServerAppError(thunkAPI.dispatch, response.data)
            const task = response.data.data.item
            return thunkAPI.rejectWithValue({})

        }
    } catch (e) {
        return thunkAPI.rejectWithValue({})
    } finally {
        thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
    }
})


export const removeTaskTC = createAsyncThunk('tasks/removeTask', async (param: { todolistId: string, taskId: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        const response = await tasksAPI.removeTask(param.todolistId, param.taskId)
        if (response.data.resultCode === 0) {
            return {todolistId: param.todolistId, taskId: param.taskId}
        } else {
            if (response.data.messages.length) {
                thunkAPI.dispatch(setAppError({error: response.data.messages[0]}))
            } else {
                thunkAPI.dispatch(setAppError({error: 'Some error'}))
            }
            return thunkAPI.rejectWithValue({})
        }
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            thunkAPI.dispatch(setAppError({error}))
        }
        return thunkAPI.rejectWithValue({})
    } finally {
        thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
    }

})

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


export type UpdateTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}


