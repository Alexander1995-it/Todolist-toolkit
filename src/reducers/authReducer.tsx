import {authApi, AuthMeResponse, LoginRequestType, ResponseResultCode} from "../api/todolistsApi";
import {AppThunk} from "../store/store";
import axios, {AxiosError} from "axios/index";
import {setAppError, setAppStatus, setInitializedStatusAC} from "./appReducer";
import {handlerServerAppError} from "../common/utils/errorUtils";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Dispatch} from "redux";


const initialState = {
    id: null as null | number,
    email: null as null | string,
    login: null as null | string,
    isLoggedIn: false
}

const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setAuthMeAC(state, action: PayloadAction<{ value: { id: number | null, email: string | null, login: string | null }, isLoggedIn: boolean }>) {
            state.isLoggedIn = action.payload.isLoggedIn
            state.id = action.payload.value.id
            state.login = action.payload.value.login
            state.email = action.payload.value.email
        },
        setLoggedInAC(state, action: PayloadAction<{ isLoggedIn: boolean }>) {
            state.isLoggedIn = action.payload.isLoggedIn
        }
    }
})

export const authReducer = slice.reducer
export const {setAuthMeAC, setLoggedInAC} = slice.actions


//type
type StateAuthType = typeof initialState


//thunk
export const AuthMeTC = () => async (dispatch: Dispatch) => {
    try {
        let response = await authApi.authMe()
        if (response.data.resultCode === ResponseResultCode.OK) {
            // dispatch(setLoggedInAC(true))
            dispatch(setAuthMeAC({value: response.data.data, isLoggedIn: true}))
            // dispatch(setAuthMeAC(response.data.data, true))
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
        dispatch(setInitializedStatusAC({value: true}))
    }
}

export const LoginTC = (data: LoginRequestType) => async (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    try {
        let response = await authApi.login(data)
        if (response.data.resultCode === ResponseResultCode.OK) {
            // dispatch(AuthMeTC())
            dispatch(setLoggedInAC({isLoggedIn: true}))
            dispatch(setAuthMeAC({value: {id: null, email: null, login: null}, isLoggedIn: true}))
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

export const logoutTC = () => async (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    try {
        let response = await authApi.logout()
        if (response.data.resultCode === 0) {
            dispatch(setLoggedInAC({isLoggedIn: false}))
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
