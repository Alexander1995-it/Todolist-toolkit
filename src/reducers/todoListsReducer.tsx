import React from 'react';
import {ResponseResultCode, todolistsAPI, TodolistType} from "../api/todolistsApi";
import axios, {AxiosError} from "axios";
import {RequestStatusType, setAppError, setAppStatus} from "./appReducer";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        changeFilterAC(state, action: PayloadAction<{ todolistID: string, filter: FilterValuesType }>) {
            const index = state.findIndex(todolist => todolist.id === action.payload.todolistID)
            state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ todolistID: string, status: RequestStatusType }>) {
            const index = state.findIndex(todolist => todolist.id === action.payload.todolistID)
            state[index].entityStatus = action.payload.status
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map(todolist => ({...todolist, filter: 'all', entityStatus: 'idle'}))
        })
        builder.addCase(createTodolistTC.fulfilled, (state, action) => {
            state.unshift({...action.payload.newTodolist, filter: 'all', entityStatus: 'idle'})
        })
        builder.addCase(deleteTodolistsTC.fulfilled, (state, action) => {
            const index = state.findIndex(todolist => todolist.id === action.payload.todolistID)
            state.splice(index, 1)
        })
    }
})

export const todolistsReducer = slice.reducer
export const {
    changeTodolistEntityStatusAC,
    changeFilterAC
} = slice.actions


export type TodoListsActionType =
    | ReturnType<typeof changeFilterAC>
    | ReturnType<typeof changeTodolistEntityStatusAC>


export const fetchTodolistsTC = createAsyncThunk('todolists/fetchTodolists', async (param, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        let response = await todolistsAPI.getTodolists()
        return {todolists: response.data}
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { message: string }).message
                : err.message
            thunkAPI.dispatch(setAppError({error}))
        }
        return thunkAPI.rejectWithValue({})
    } finally {
        thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
    }
})

export const createTodolistTC = createAsyncThunk('todolists/createTodolist', async (newTodolist: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        let response = await todolistsAPI.addTodolist(newTodolist)
        return {newTodolist: response.data.data.item}
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

export const deleteTodolistsTC = createAsyncThunk('todolists/deleteTodolist', async (todolistID: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    thunkAPI.dispatch(changeTodolistEntityStatusAC({todolistID, status: 'loading'}))
    try {
        const response = await todolistsAPI.deleteTodolists(todolistID)
        if (response.data.resultCode === ResponseResultCode.OK) {
            return {todolistID}
        }
        return thunkAPI.rejectWithValue({})
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
        thunkAPI.dispatch(changeTodolistEntityStatusAC({todolistID, status: 'succeeded'}))
    }
})
//thunks


//types
export type FilterValuesType = "all" | "active" | "completed";

export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}


