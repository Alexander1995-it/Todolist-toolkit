import React, {useEffect} from 'react';
import AddItemForm from "../../common/AddItemForm/AddItemForm";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import style from '../../components/TodoList/TodoList.module.css'
import {changeFilterAC, deleteTodolistsTC, TodolistDomainType} from "../../reducers/todoListsReducer";
import {createTaskTC, fetchTasksTC} from "../../reducers/tasksReducer";
import Task from "../Task/Task";
import {useAppDispatch, useAppSelector} from "../../common/hooks/hooks";
import {TaskStatuses, TaskType} from "../../api/todolistsApi";
import {Button} from "@mui/material";


type PropsType = {
    todoList: TodolistDomainType
    title: string
}

export const TodoList = (props: PropsType) => {

    let dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(fetchTasksTC(props.todoList.id))
    }, [])
    let tasks = useAppSelector<TaskType[]>(state => state.tasks[props.todoList.id])

//handlerFilter
    const onAllClickHandler = () => dispatch(changeFilterAC(props.todoList.id, "all"));
    const onActiveClickHandler = () => dispatch(changeFilterAC(props.todoList.id, "active"));
    const onCompletedClickHandler = () => dispatch(changeFilterAC(props.todoList.id, "completed"));

    const onClickDeleteTodoList = () => dispatch(deleteTodolistsTC(props.todoList.id))

    const addTaskHandler = (newTitle: string) => {
        dispatch(createTaskTC(props.todoList.id, newTitle))
    }

    if (props.todoList.filter === "active") {
        tasks = tasks.filter(t => t.status === TaskStatuses.New);
    }
    if (props.todoList.filter === "completed") {
        tasks = tasks.filter(t => t.status === TaskStatuses.Completed);
    }
    return <div className={style.todoListBlock}>
        <div className={style.title__delete}>
            <h3>{props.title}</h3>
            <IconButton
                onClick={onClickDeleteTodoList}
                disabled={props.todoList.entityStatus === 'loading'}
                aria-label="delete">
                <DeleteIcon/>
            </IconButton>
        </div>
        <div>
            <AddItemForm label='Add task' disabled={props.todoList.entityStatus === 'loading'}
                         callBack={addTaskHandler}/>
        </div>
        <ul className={style.listTodo}>
            {
                tasks.map(t => <Task key={t.id} task={t} todolistId={props.todoList.id}/>)
            }
        </ul>
        <div>

            <Button variant={props.todoList.filter === 'all' ? "contained" : "text"} color="success"
                    onClick={onAllClickHandler}>All</Button>
            <Button variant={props.todoList.filter === 'active' ? "contained" : "text"} color="secondary"
                    onClick={onActiveClickHandler}>Active</Button>
            <Button variant={props.todoList.filter === 'completed' ? "contained" : "text"} color="error"
                    onClick={onCompletedClickHandler}>Completed</Button>

        </div>
    </div>
}
