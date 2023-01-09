import React from 'react';
import {ResponseResultCode, todolistsAPI, TodolistType} from "../api/todolistsApi";
import {AppThunk} from "../store/store";
import axios, {AxiosError} from "axios";
import {RequestStatusType, setAppError, setAppStatus} from "./appReducer";


const initialState: Array<TodolistDomainType> = []

export const todoListsReducer = (state: Array<TodolistDomainType> = initialState, action: TodoListsActionType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'SET_TODOLISTS': {
            return action.todolists.map(t => ({...t, filter: 'all', entityStatus: 'idle'}))
        }
        case 'ADD_TODOLIST': {
            return [{...action.newTitle, filter: 'all', entityStatus: 'idle'}, ...state]
        }
        case 'REMOVE_TODOLIST': {
            return state.filter(el => el.id !== action.todolistID)
        }
        case 'CHANGE_FILTER': {
            return state.map(t => t.id === action.payload.todoListID ? {...t, filter: action.payload.value} : t)
        }
        case 'SET_ENTITY_STATUS': {
            return state.map(t => t.id === action.id ? {...t, entityStatus: action.status} : t)
        }
        default:
            return state
    }
};

export type TodoListsActionType =
    | ReturnType<typeof setTodolistsAC>
    | ReturnType<typeof removeTodoListAC>
    | ReturnType<typeof addTodoListAC>
    | ReturnType<typeof changeFilterAC>
    | ReturnType<typeof changeTodolistEntityStatusAC>


// actions
export const removeTodoListAC = (todolistID: string) => ({type: 'REMOVE_TODOLIST', todolistID} as const)
export const addTodoListAC = (newTitle: TodolistType) => ({type: 'ADD_TODOLIST', newTitle} as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET_TODOLISTS', todolists} as const)
export const changeFilterAC = (todoListID: string, value: FilterValuesType) => ({
    type: 'CHANGE_FILTER',
    payload: {todoListID, value}
} as const)
export const changeTodolistEntityStatusAC = (id: string, status: RequestStatusType) => ({
    type: 'SET_ENTITY_STATUS',
    id,
    status
} as const)

//thunks
export const fetchTodolistsTC = (): AppThunk => async (dispatch) => {
    dispatch(setAppStatus('loading'))
    try {
        let response = await todolistsAPI.getTodolists()
        dispatch(setTodolistsAC(response.data))
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { message: string }).message
                : err.message
            dispatch(setAppError(error))
        }
    } finally {
        dispatch(setAppStatus('succeeded'))
    }

}
export const createTodolistTC = (newTodolist: string): AppThunk => async (dispatch) => {
    dispatch(setAppStatus('loading'))
    try {
        let response = await todolistsAPI.addTodolist(newTodolist)
        dispatch(addTodoListAC(response.data.data.item))
        dispatch(setAppStatus('loading'))
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
export const deleteTodolistsTC = (todoListID: string): AppThunk => async (dispatch) => {
    dispatch(setAppStatus('loading'))
    dispatch(changeTodolistEntityStatusAC(todoListID, 'loading'))
    try {
        const response = await todolistsAPI.deleteTodolists(todoListID)
        if (response.data.resultCode === ResponseResultCode.OK) {
            dispatch(removeTodoListAC(todoListID))
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
        dispatch(changeTodolistEntityStatusAC(todoListID, 'succeeded'))
    }
}


//types
export type FilterValuesType = "all" | "active" | "completed";

export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}


