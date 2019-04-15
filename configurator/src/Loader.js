/**
 * @imports
 */
import React, {Component} from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Theme from './theme';
import DarkTheme from './theme/dark';
import App from './App';
import {hydrate, subscribe} from "./data";
import {updateSerialDevices} from "./data/serial";

/**
 * @component
 */
export default class Loader extends Component {

    /**
     * @type {{hydrated: boolean}}
     */
    state = {
        hydrated: false,
        darkMode: false,
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        Promise.all([
            hydrate(),
            updateSerialDevices()
        ]).then(() => {
            this.setState({hydrated: true});
            subscribe("darkMode", darkMode => this.setState({darkMode}));
        });

    }

    /**
     * @render
     * @returns {*}
     */
    render() {

        const {darkMode, hydrated} = this.state;

        if(!hydrated) return null;

        return (
            <MuiThemeProvider
                theme={darkMode ? DarkTheme : Theme}
            >
                <CssBaseline />
                <App />
            </MuiThemeProvider>
        )
    }
}