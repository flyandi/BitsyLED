/**
 * @imports
 */
import React, {Component} from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Theme from './theme';
import App from './App';
import {hydrate} from "./data";
import {updateSerialDevices} from "./data/serial";

/**
 * @component
 */
export default class Loader extends Component {

    /**
     * @type {{hydrated: boolean}}
     */
    state = {
        hydrated: false
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        Promise.all([
            hydrate(),
            updateSerialDevices()
        ]).then(() => this.setState({hydrated: true}))
    }

    /**
     * @render
     * @returns {*}
     */
    render() {

        if(!this.state.hydrated) return null;

        return (
            <MuiThemeProvider
                theme={Theme}
            >
                <CssBaseline />
                <App />
            </MuiThemeProvider>
        )
    }
}