/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import ConnectIcon from '@material-ui/icons/PlayArrow';
import CloseIcon from '@material-ui/icons/Stop';
import InfoIcon from '@material-ui/icons/PermDeviceInformation';
import SaveIcon from '@material-ui/icons/SaveAlt';
import {subscribe, getState, setState} from "../../data";
import {updateSerialDevices, convertToChunks, getSerialPayload, SerialStatus, SerialCommand} from "../../data/serial";
import {SerialConnection} from 'chrome-netconn'
import {ObjectArray} from "../../lib";
import InfoDialog from './info';
import SerialMessages from './messages';

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        padding: `${theme.spacing.unit * 3}px ${theme.spacing.unit * 4}px`,
        flexGrow: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    grow: {
        flexGrow: 1,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    menu: {
        width: 200,
    },
    logo: {
        height: 30,
        opacity: 0.5,
        marginRight: theme.spacing.unit * 2,
    }
});

/**
 * @class
 */
class _SerialMenu extends Component {

    /**
     * @type {{configuration: {}}}
     */
    static defaultProps = {
        configuration: {}
    }

    /**
     * @type {{}}
     */
    state = {
        devices: [],
        selected: getState().selectedSerialPort,
        connected: false,
        serial: false,
        lastSerialError: false,
        status: SerialStatus.DISCONNECTED,
        serialCurrentChunk: 0,
    }

    /**
     * @type {Array}
     */
    serialBuffer = [];

    /**
     * @type {Array}
     */
    serialTextBuffer = [];

    /**
     * @type {boolean}
     */
    serialCommand = false;

    /**
     * @type {boolean}
     */
    serialTimeout = false;

    /**
     * @type {Array}
     */
    serialTransferChunks = [];

    /**
     * @param event
     */
    handleChange = event => {
        this.setState({
            selected: event.target.value,
        }, () => {
            setState({selectedSerialPort: this.state.selected})
        });
    };

    /**
     * @param error
     */
    handleSerialError(error) {
        const {serial} = this.state;
        if(serial) {
            serial.close(() => this.setState({connected: false, serial: false, status: SerialStatus.DISCONNECTED}, () => {
                setState({serialChannelValue: false}); // clear
            }));
        }
    }

    /**
     * @handleConnection
     */
    handleConnection() {
        let {serial} = this.state;
        const {baud} = this.props.configuration;

        if(!serial) {
            this.setState({status: SerialStatus.CONNECTING});
            SerialConnection.connect(this.state.selected, {
                bitrate: parseInt(baud)
            }, {
                onReceive: (data, len) => this.processSerial(data, len),
                onError: err => this.handleSerialError(err)
            }).then(serial => {
                this.setState({serial, status: SerialStatus.CONNECTED}, () => {
                    // request info
                    this.getSerialInfo();
                });
            });
        } else {
            this.handleSerialError('close');
        }
    }

    /**
     *
     * @param received
     * @param len
     */
    processSerial(received, len) {

        const data = new Uint8Array(received);;

        if(this.serialCommand) {
            clearTimeout(this.serialTimeout);
            this.serialBuffer.push(data[0]);
            if(this.serialBuffer.length == this.serialCommand.expected) {
                if(!this.serialCommand.invoke(this.serialBuffer, this)) { // must return false to continue
                    this.serialCommand = false;
                } else {
                    this.serialBuffer = []; // clear for next use
                }
            } else {
                this.serialTimeout = setTimeout(() => {
                    this.serialCommand = false;
                    console.log("Serial Data Timeout");
                    this.setState({serialTransfer: false});
                }, 3000);
            }
        } else {
            ObjectArray(SerialCommand).forEach(sc => {
                const cmd = new Uint8Array([sc.cmd]);
                if (cmd[0] == data[0]) {
                    if(sc.expected == 0) {
                        sc.invoke(true, this);
                    } else {
                        this.serialBuffer = [];
                        this.serialCommand = sc;
                    }
                }
            });
        }
    }

    /**
     * @void
     */
    getSerialInfo() {
        let {serial} = this.state;
        if(!Boolean(serial)) return;
        serial.send(new Uint8Array([SerialCommand.STATUS.cmd])).then(r => console.log(r));
    }

    /**
     * @param datax
     */
    updateSerialData() {

        const {selectedConfiguration, serial} = this.state;
        if(!selectedConfiguration) return;

        const payload = getSerialPayload(selectedConfiguration);
        const chunks = convertToChunks(payload);

        if(!Boolean(serial)) return;
        this.serialTransferChunks = chunks;
        this.setState({serialCurrentChunk: 0, serialTransfer: true, status: SerialStatus.SYNCING}, () => {
            this.transferSerialChunk();
        });
    }


    /**
     * Check
     */
    transferSerialChunk() {
        const {serialTransfer, serialCurrentChunk, serial} = this.state;
        if(!Boolean(serial) || !serialTransfer || !this.serialTransferChunks[serialCurrentChunk]) {
            return this.setState({serialTransfer: false});
        }
        serial.send(new Uint8Array(this.serialTransferChunks[serialCurrentChunk])).then(r => {
            this.setState({serialCurrentChunk: serialCurrentChunk + 1});
        });
    }


    completeSerialTransfer() {
        this.setState({serialTransfer: false, status: SerialStatus.DONE});
        setTimeout(() => {
            this.setState({serialTransfer: false, status: SerialStatus.CONNECTED});
        }, 2000);
    }

    /**
     * @componentDidMount
     */
    componentDidMount() {
        subscribe("serialPorts", devices => this.setState({devices}));
        subscribe("serialBoardStatus", info => {
            console.log(info);
            this.setState({info, infoDialog: Boolean(info)});
        });
        subscribe("selectedConfiguration", () => this.setState({selectedConfiguration: getState().selectedConfiguration}));
        this.updateSerialData();
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes} = this.props;
        const {devices, serial, status, info, infoDialog} = this.state;

        return (
            <Fragment>
                <Grid
                    container
                    className={classes.root}
                    justify="space-between"
                    alignItems="center"
                >
                    <Grid item>
                        <Grid container alignItems="center">
                            <Grid item>
                                <TextField
                                    disabled={Boolean(serial)}
                                    id="outlined-select-devices"
                                    select
                                    label="Serial Port"
                                    className={classes.textField}
                                    value={this.state.selected}
                                    onChange={event =>this.handleChange(event)}
                                    SelectProps={{
                                        MenuProps: {
                                            className: classes.menu,
                                        },
                                    }}
                                    variant="outlined"
                                >
                                    {devices.map(device => (
                                        <MenuItem key={device.path} value={device.path}>
                                            {device.path}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            {!Boolean(serial) ? (
                                <Grid item>
                                    <IconButton onClick={() => updateSerialDevices()}>
                                        <RefreshIcon/>
                                    </IconButton>
                                </Grid>
                            ) : null}
                            <Grid item>
                                <IconButton onClick={() => this.handleConnection()}>
                                    {Boolean(serial) ? <CloseIcon/> : <ConnectIcon/>}
                                </IconButton>
                            </Grid>
                            {Boolean(serial) ? (
                                <Fragment>
                                    <Grid item>
                                        <IconButton onClick={() => this.getSerialInfo()}>
                                           <InfoIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid item>
                                        <IconButton onClick={() => this.updateSerialData()}>
                                            <SaveIcon color="primary" />
                                        </IconButton>
                                    </Grid>
                                </Fragment>
                            ) : null}
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Typography color="primary">{status}</Typography>
                    </Grid>
                </Grid>
                <InfoDialog open={infoDialog} onClose={() => this.setState({infoDialog: false})} info={info} />

            </Fragment>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles)(_SerialMenu);