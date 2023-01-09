import React, {ChangeEvent, useState} from 'react';
import {Button, TextField} from "@mui/material";

type AddItemFormPropsType = {
    callBack: (title: string) => void
    disabled?: boolean
    label?: string

}

const AddItemForm = (props: AddItemFormPropsType) => {

    const {callBack} = props
    let [title, setTitle] = useState('')

    const onClickHandler = () => {
        callBack(title)
        setTitle('')
    }

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.currentTarget.value)
    }

    return (
        <div>
            <TextField
                size={'small'}
                onChange={onChangeHandler}
                value={title}
                id="outlined-basic"
                label={props.label ? props.label : 'Outlined'}
                variant='outlined'/>
            <Button
                onClick={onClickHandler}
                disabled={props.disabled}
                variant="contained"
                style={{maxWidth: '38px', maxHeight: '38px', minWidth: '38px', minHeight: '38px'}}
            >
                +
            </Button>
        </div>
    );
};

export default AddItemForm;