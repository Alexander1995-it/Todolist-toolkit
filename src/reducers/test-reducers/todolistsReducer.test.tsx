import {v1} from "uuid";
import {
    changeFilterAC, createTodolistTC, deleteTodolistsTC,
    TodolistDomainType,
    todolistsReducer
} from "../todoListsReducer";


let startState: Array<TodolistDomainType>

const todolistID1 = v1()
const todolistID2 = v1()

beforeEach(() => {
    startState = [
        {id: todolistID1, title: 'What to learn', addedDate: '', order: 1, filter: 'all', entityStatus: 'idle'},
        {id: todolistID2, title: 'What to buy', addedDate: '', order: 1, filter: 'all', entityStatus: 'idle'}
    ]
})


test('correct todolist should be removed', () => {

    const endState = todolistsReducer(startState, deleteTodolistsTC.fulfilled({todolistID: todolistID1}, '', todolistID1))

    expect(endState.length).toBe(1)
    expect(endState[0].id).toBe(todolistID2)
})

test('correct todolist should be added', () => {

    const newTodolist = {
        id: v1(),
        title: 'New Todolist',
        addedDate: '',
        order: 1
    }


    const endState = todolistsReducer(startState, createTodolistTC.fulfilled({newTodolist: newTodolist}, '', 'New Todolist'))

    expect(endState.length).toBe(3)
    expect(endState[0].title).toBe('New Todolist')
    expect(endState[0].filter).toBe('all')
    expect(endState[2].title).toBe('What to buy')
})

test('correct filter of todolist should be changed', () => {

    const newTodolist = {
        id: v1(),
        title: 'New Todolist',
        addedDate: '',
        order: 1
    }

    const endState = todolistsReducer(startState, changeFilterAC({todolistID: todolistID1, filter: 'active'}))

    expect(endState.length).toBe(2)
    expect(endState[0].filter).toBe('active')
    expect(endState[1].filter).toBe('all')
})