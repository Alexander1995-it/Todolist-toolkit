import React from 'react'
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {useFormik} from "formik";
import {useAppDispatch, useAppSelector} from "../../common/hooks/hooks";
import {LoginTC} from "../../reducers/authReducer";
import {Navigate} from "react-router-dom";

type ErrorsType = {
    email?: string
    password?: string
    rememberMe?: boolean
}

export const LoginPage = () => {


    const dispatch = useAppDispatch()
    const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn)

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false
        },
        validate: values => {
            const errors: ErrorsType = {};

            if (!values.email) {
                errors.email = 'Required';
            } else if (values.email.length < 5) {
                errors.email = 'Min 5 characters';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
                errors.email = 'Invalid email address'
            }

            if (!values.password) {
                errors.password = 'Required';
            } else if (values.password.length < 6) {
                errors.password = 'Min 6 characters';
            }
            return errors;
        },
        onSubmit: values => {
            dispatch(LoginTC(values))
        },
    });

    if (isLoggedIn) {
        return <Navigate to={'/'}/>
    }
    return <Grid container justifyContent={'center'}>
        <Grid item justifyContent={'center'}>
            <FormControl>
                <form onSubmit={formik.handleSubmit}>
                    <FormGroup>
                        <TextField id="email" type="email"
                                   {...formik.getFieldProps("email")}
                                   label="Email"
                                   margin="normal"/>
                        {formik.touched.email && formik.errors.email &&
                            <div style={{color: 'red'}}>{formik.errors.email}</div>}
                        <TextField id="password"
                                   {...formik.getFieldProps("password")}
                                   type="password"
                                   label="Password"
                                   margin="normal"
                        />
                        {formik.touched.password && formik.errors.password &&
                            <div style={{color: 'red'}}>{formik.errors.password}</div>}
                        <FormControlLabel id="rememberMe"
                                          {...formik.getFieldProps("rememberMe")}
                                          checked={formik.values.rememberMe}
                                          label={'Remember me'} control={<Checkbox/>}/>
                        <Button type={'submit'} variant={'contained'} color={'primary'}>
                            Login
                        </Button>
                    </FormGroup>
                </form>
            </FormControl>
        </Grid>
    </Grid>
}