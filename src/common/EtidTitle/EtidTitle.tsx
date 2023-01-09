import React, {ChangeEvent, useState} from 'react';

type EtidTitlePropsType = {
    title: string
    callBack: (title: string) => void

}

export const EditableSpan = (props: EtidTitlePropsType) => {

    const [edit, setEdit] = useState(false)
    const [newTitle, setNewTitle] = useState(props.title)

    const addTask = () => {
        if (newTitle !== '') {
            props.callBack (newTitle)
        }
    }

    const editHandler = () => {
        setEdit(!edit)
        addTask ()
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setNewTitle(e.currentTarget.value)
    }

    return (
        edit
        ? <input value={newTitle} onChange={onChangeHandler} onBlur={editHandler} autoFocus/>
        : <span onDoubleClick={editHandler}>{props.title}</span>
    )
}

