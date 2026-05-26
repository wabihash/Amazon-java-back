import React, { useContext } from 'react';
import { DataContext } from '../../Components/DataProvider/DataProvider';
import { Type } from '../../Utility/ActionType';
import { FaSun, FaMoon } from 'react-icons/fa';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const [{ theme }, dispatch] = useContext(DataContext);

    const toggleTheme = () => {
        dispatch({
            type: Type.TOGGLE_THEME
        });
    };
    return (
        <div className={`theme__toggle ${theme}`} onClick={toggleTheme}>
            <div className="toggle__ball">
                {theme === 'light' ? <FaSun className="icon" /> : <FaMoon className="icon" />}
            </div>
        </div>
    );
};

export default ThemeToggle;
