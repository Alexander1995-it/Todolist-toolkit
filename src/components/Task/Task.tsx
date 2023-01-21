import React, {ChangeEvent} from 'react';
import {Checkbox} from "@mui/material";
import {EditableSpan} from "../../common/EtidTitle/EtidTitle";
import {removeTaskTC, updateTaskTC} from "../../reducers/tasksReducer";
import {TaskStatuses, TaskType} from "../../api/todolistsApi";
import {useAppDispatch} from "../../common/hooks/hooks";


export type TaskPropsType = {
    task: TaskType
    todolistId: string
}

const Task = React.memo(({task, todolistId}: TaskPropsType) => {
    const dispatch = useAppDispatch()

    const editTaskHandler = (todolistId: string, taskId: string, newTitle: string) => {
        dispatch(updateTaskTC({todolistId, taskId, model: {title: newTitle}}))
    }
    const onHandlerDelete = () => dispatch(removeTaskTC({todolistId, taskId: task.id}))
    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        let newIsDoneValue = e.currentTarget.checked
        dispatch(updateTaskTC({
            todolistId,
            taskId: task.id,
            model: {status: newIsDoneValue ? TaskStatuses.Completed : TaskStatuses.New}
        }))
    }

    return (
        <li className={task.status === 1 ? "is-done" : ""}>
            <Checkbox defaultChecked onChange={onChangeHandler} checked={task.status === 2}/>
            <EditableSpan callBack={(title) => editTaskHandler(todolistId, task.id, title)} title={task.title}/>
            <button onClick={onHandlerDelete}>x</button>
        </li>
    );
});

export default Task;

