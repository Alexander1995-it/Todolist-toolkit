import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState = {
    status: 'idle' as RequestStatusType,
    error: null as null | string,
    isInitialized: false
}

const slice = createSlice(({
    name: 'app',
    initialState: initialState,
    reducers: {
        setAppStatus(state, action: PayloadAction<{ status: RequestStatusType }>) {
            state.status = action.payload.status
        },
        setAppError(state, action: PayloadAction<{ error: string | null }>) {
            state.error = action.payload.error
        },
        setInitializedStatusAC(state, action: PayloadAction<{ value: boolean }>) {
            state.isInitialized = action.payload.value
        }
    }

}))

export const appReducer = slice.reducer
export const {setAppStatus, setAppError, setInitializedStatusAC} = slice.actions

type InitialStateType = typeof initialState


//types
export type AppActionsType = SetAppStatusType | SetAppErrorType | SetInitializedStatusType
export type SetAppStatusType = ReturnType<typeof setAppStatus>
export type SetAppErrorType = ReturnType<typeof setAppError>
export type SetInitializedStatusType = ReturnType<typeof setInitializedStatusAC>

