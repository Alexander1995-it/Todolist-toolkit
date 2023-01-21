import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {authApi, ResponseResultCode} from "../api/todolistsApi";
import {handlerServerAppError} from "../common/utils/errorUtils";
import axios, {AxiosError} from "axios";
import {setAuthMeAC} from "./authReducer";

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
        }
    },
    extraReducers: (builder) => {
        builder.addCase(initializedAppTC.fulfilled, (state, action) => {
            state.isInitialized = action.payload.value
        })
    }

}))

export const appReducer = slice.reducer
export const {setAppStatus, setAppError} = slice.actions

export const initializedAppTC = createAsyncThunk ('app/initialized', async (param, thunkAPI) => {
    try {
        let response = await authApi.authMe()
        if (response.data.resultCode === ResponseResultCode.OK) {
            thunkAPI.dispatch(setAuthMeAC({value: response.data.data, isLoggedIn: true}))
        } else {
            handlerServerAppError(thunkAPI.dispatch, response.data)
            return thunkAPI.rejectWithValue({})
        }
    } catch (e) {
        let err = e as AxiosError | Error
        if (axios.isAxiosError(err)) {
            const error = err.response?.data
                ? (err.response.data as { error: string }).error
                : err.message
            thunkAPI.dispatch(setAppError({error}))
            return thunkAPI.rejectWithValue({})
        }
    } finally {
        return {value: true}
    }
})

type InitialStateType = typeof initialState


//types
export type AppActionsType = SetAppStatusType | SetAppErrorType
export type SetAppStatusType = ReturnType<typeof setAppStatus>
export type SetAppErrorType = ReturnType<typeof setAppError>

