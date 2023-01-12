import React from 'react';
import {ResponseResultCode, todolistsAPI, TodolistType} from "../api/todolistsApi";
import {AppThunk} from "../store/store";
import axios, {AxiosError} from "axios";
import {RequestStatusType, setAppError, setAppStatus} from "./appReducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Dispatch} from "redux";


const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: 'todoLists',
    initialState: initialState,
    reducers: {
        removeTodoListAC(state, action: PayloadAction<{ todolistID: string }>) {
            const index = state.findIndex(todolist => todolist.id === action.payload.todolistID)
            state.splice(index, 1)
        },
        addTodoListAC(state, action: PayloadAction<{ newTodolist: TodolistType }>) {
            state.unshift({...action.payload.newTodolist, filter: 'all', entityStatus: 'idle'})
        },
        setTodolistsAC(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
            return action.payload.todolists.map(todolist => ({...todolist, filter: 'all', entityStatus: 'idle'}))
        },
        changeFilterAC(state, action: PayloadAction<{ todolistID: string, filter: FilterValuesType }>) {
            const index = state.findIndex(todolist => todolist.id === action.payload.todolistID)
            state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ todolistID: string, status: RequestStatusType }>) {
            const index = state.findIndex(todolist => todolist.id === action.payload.todolistID)
            state[index].entityStatus = action.payload.status
        }
    }
})

export const todolistsReducer = slice.reducer
export const {
    setTodolistsAC,
    changeTodolistEntityStatusAC,
    changeFilterAC,
    addTodoListAC,
    removeTodoListAC
} = slice.actions


export type TodoListsActionType =
    | ReturnType<typeof setTodolistsAC>
    | ReturnType<typeof removeTodoListAC>
    | ReturnType<typeof addTodoListAC>
    | ReturnType<typeof changeFilterAC>
    | ReturnType<typeof changeTodolistEntityStatusAC>


//thunks
export const fetchTodolistsTC = () => async (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    try {
        let response = await todolistsAPI.getTodolists()
        dispatch(setTodolistsAC({todolists: response.data}))
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { message: string }).message
                : err.message
            dispatch(setAppError({error}))
        }
    } finally {
        dispatch(setAppStatus({status: 'succeeded'}))
    }

}
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


