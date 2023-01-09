import {setAppError, SetAppErrorType} from "../../reducers/appReducer";
import {Dispatch} from "redux";
import {ResponseType} from "../../api/todolistsApi";


export const handlerServerAppError = (dispatch: ErrorUtilsDispatchType, data: ResponseType) => {
    if (data.messages.length) {
        dispatch(setAppError(data.messages[0]))
    } else {
        dispatch(setAppError('Some error'))
    }
}

//types
type ErrorUtilsDispatchType = Dispatch<SetAppErrorType>