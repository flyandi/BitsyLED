/**
 * @imports
 */
import React from 'react';
import ReactDOM from 'react-dom';
import Loader from './Loader';

/**
 * @native-imports
 */
const { autoUpdater }  = window.require("electron").remote.require("electron-updater");

autoUpdater.checkForUpdatesAndNotify();

ReactDOM.render(<Loader />, document.getElementById('root'));
