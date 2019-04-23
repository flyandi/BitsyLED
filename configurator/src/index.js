import React from 'react';
import ReactDOM from 'react-dom';
import Loader from './Loader';
const { autoUpdater } = require("electron-updater");

autoUpdater.checkForUpdatesAndNotify();
ReactDOM.render(<Loader />, document.getElementById('root'));
