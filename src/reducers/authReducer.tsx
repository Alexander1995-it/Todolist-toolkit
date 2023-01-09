import {authApi, AuthMeResponse, LoginRequestType, ResponseResultCode} from "../api/todolistsApi";
import {AppThunk} from "../store/store";
import axios, {AxiosError} from "axios/index";
import {setAppError, setAppStatus, setInitializedStatusAC} from "./appReducer";
import {handlerServerAppError} from "../common/utils/errorUtils";

const initialState = {
    id: null as null | number,
    email: null as null | string,
    login: null as null | string,
    isLoggedIn: false
}

export const authReducer = (state: StateAuthType = initialState, action: LoginActionType): StateAuthType => {
    switch (action.type) {
        case 'SET_AUTH_ME': {
            return {...state, ...action.data, isLoggedIn: action.isLoggedIn}
        }
        case 'IS_LOGGED_IN': {
            return {...state, isLoggedIn: action.isLoggedIn}
        }
        default:
            return state
    }
}

//type
type StateAuthType = typeof initialState
export type LoginActionType = ReturnType<typeof setAuthMeAC> | ReturnType<typeof setLoggedInAC>

//action
const setAuthMeAC = (data: AuthMeResponse, isLoggedIn: boolean) => ({type: 'SET_AUTH_ME', data, isLoggedIn} as const)
export const setLoggedInAC = (isLoggedIn: boolean) => ({type: 'IS_LOGGED_IN', isLoggedIn} as const)

//thunk
export const AuthMeTC = (): AppThunk => async (dispatch) => {
    try {
        let response = await authApi.authMe()
        if (response.data.resultCode === ResponseResultCode.OK) {
            // dispatch(setLoggedInAC(true))
            dispatch(setAuthMeAC(response.data.data, true))
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
        dispatch(setInitializedStatusAC(true))
    }
}

export const LoginTC = (data: LoginRequestType): AppThunk => async (dispatch) => {
    dispatch(setAppStatus('loading'))
    try {
        let response = await authApi.login(data)
        if (response.data.resultCode === ResponseResultCode.OK) {
            dispatch(setLoggedInAC(true))
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

export const logoutTC = (): AppThunk => async (dispatch) => {
    dispatch(setAppStatus('loading'))
    try {
        let response = await authApi.logout()
        if (response.data.resultCode === 0) {
            dispatch(setLoggedInAC(false))
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
