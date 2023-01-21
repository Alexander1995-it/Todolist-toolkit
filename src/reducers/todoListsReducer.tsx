import React from 'react';
import {ResponseResultCode, todolistsAPI, TodolistType} from "../api/todolistsApi";
import {AppThunk} from "../store/store";
import axios, {AxiosError} from "axios";
import {RequestStatusType, setAppError, setAppStatus} from "./appReducer";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";


const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        removeTodoListAC(state, action: PayloadAction<{ todolistID: string }>) {
            const index = state.findIndex(todolist => todolist.id === action.payload.todolistID)
            state.splice(index, 1)
        },
        addTodoListAC(state, action: PayloadAction<{ newTodolist: TodolistType }>) {
            state.unshift({...action.payload.newTodolist, filter: 'all', entityStatus: 'idle'})
        },
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
    }
})

export const todolistsReducer = slice.reducer
export const {
    changeTodolistEntityStatusAC,
    changeFilterAC,
    addTodoListAC,
    removeTodoListAC
} = slice.actions


export type TodoListsActionType =
    | ReturnType<typeof removeTodoListAC>
    | ReturnType<typeof addTodoListAC>
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

//thunks

export const createTodolistTC = (newTodolist: string): AppThunk => async (dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    try {
        let response = await todolistsAPI.addTodolist(newTodolist)
        dispatch(addTodoListAC({newTodolist: response.data.data.item}))
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
export const deleteTodolistsTC = (todolistID: string): AppThunk => async (dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    dispatch(changeTodolistEntityStatusAC({todolistID, status: 'loading'}))
    try {
        const response = await todolistsAPI.deleteTodolists(todolistID)
        if (response.data.resultCode === ResponseResultCode.OK) {
            dispatch(removeTodoListAC({todolistID}))
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
        dispatch(changeTodolistEntityStatusAC({todolistID, status: 'succeeded'}))
    }
}


//types
export type FilterValuesType = "all" | "active" | "completed";

export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}


