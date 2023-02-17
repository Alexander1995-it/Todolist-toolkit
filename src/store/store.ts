import {combineReducers} from "redux";
import {tasksReducer} from "../reducers/tasksReducer";
import {ThunkAction} from "redux-thunk";
import thunkMiddleware from 'redux-thunk'
import {AppActionsType, appReducer} from "../reducers/appReducer";
import {authReducer} from "../reducers/authReducer";
import {configureStore} from "@reduxjs/toolkit";
import {TodoListsActionType, todolistsReducer} from "../reducers/todoListsReducer";


const rootReducer = combineReducers({
    app: appReducer,
    tasks: tasksReducer,
    todolists: todolistsReducer,
    auth: authReducer
})


export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(thunkMiddleware)
})


export type AppRootStateType = ReturnType<typeof store.getState>

export type AppActionType = TodoListsActionType | AppActionsType

export type AppDispatch = typeof store.dispatch

// export type AppDispatch = ThunkDispatch<AppRootStateType, unknown, AppActionType>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppRootStateType, unknown, AppActionType>