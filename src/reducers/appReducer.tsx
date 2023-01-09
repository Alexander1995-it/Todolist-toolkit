export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState = {
    status: 'idle' as RequestStatusType,
    error: null as null | string,
    isInitialized: false
}

type InitialStateType = typeof initialState

export const appReducer = (state: InitialStateType = initialState, action: AppActionsType): InitialStateType => {
    switch (action.type) {
        case 'APP/SET_STATUS': {
            return {...state, status: action.status}
        }
        case 'APP/SET_ERROR': {
            return {...state, error: action.error}
        }
        case 'APP/SET_INITIALIZED_STATUS': {
            return {...state, isInitialized: action.value}
        }
        default:
            return state
    }
}

//actions
export const setAppStatus = (status: RequestStatusType) => ({type: 'APP/SET_STATUS', status} as const)
export const setAppError = (error: string | null) => ({type: 'APP/SET_ERROR', error} as const)
export const setInitializedStatusAC = (value: boolean) => ({type: 'APP/SET_INITIALIZED_STATUS', value} as const)


//types
export type AppActionsType = SetAppStatusType | SetAppErrorType | SetInitializedStatusType
export type SetAppStatusType = ReturnType<typeof setAppStatus>
export type SetAppErrorType = ReturnType<typeof setAppError>
export type SetInitializedStatusType = ReturnType<typeof setInitializedStatusAC>

