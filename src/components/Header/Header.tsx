import React from 'react';
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {useAppDispatch, useAppSelector} from "../../common/hooks/hooks";
import {logoutTC} from "../../reducers/authReducer";
import style from './Header.module.css'
import LogoutIcon from '@mui/icons-material/Logout';

const Header = () => {

    const dispatch = useAppDispatch()
    const login = useAppSelector(state => state.auth)

    const logOutHandler = () => {
        dispatch(logoutTC())
    }

    return (
        <div>
            <Box sx={{flexGrow: 1}}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            TodoList
                        </Typography>
                        {login.isLoggedIn &&
                            <div className={style.loginBlock}>
                                <div className={style.loginText}>{login.login}</div>
                                <div className={style.loginIcon}><LogoutIcon onClick={logOutHandler}/></div>
                            </div>
                        }
                    </Toolbar>
                </AppBar>
            </Box>
        </div>
    );
};

export default Header;