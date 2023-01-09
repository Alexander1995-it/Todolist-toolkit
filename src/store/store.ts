import {applyMiddleware, combineReducers, legacy_createStore} from "redux";
import {tasksReducer} from "../reducers/tasksReducer";
import {TodoListsActionType, todoListsReducer} from "../reducers/todoListsReducer";
import {TasksActionType} from '../reducers/tasksReducer'
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import thunkMiddleware from 'redux-thunk'
import {AppActionsType, appReducer} from "../reducers/appReducer";
import {LoginActionType, authReducer} from "../reducers/authReducer";

const rootReducer = combineReducers({
    app: appReducer,
    tasks: tasksReducer,
    todoLists: todoListsReducer,
    auth: authReducer
})

export const store = legacy_createStore(rootReducer, applyMiddleware(thunkMiddleware))

export type AppRootStateType = ReturnType<typeof rootReducer>

export type AppActionType = TodoListsActionType | TasksActionType | AppActionsType | LoginActionType


export type AppDispatch = ThunkDispatch<AppRootStateType, unknown, AppActionType>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppRootStateType, unknown, AppActionType>