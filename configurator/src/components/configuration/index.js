/**
 * @imports
 */
import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Dropdown from '../dropdown';
import {uuid} from "../../lib";
import {Layouts, Inputs, Resolutions, Defaults, Bauds, Boards} from "../../constants";


/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        minWidth: 400,
    },
    margin: {
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    textField: {
        marginRight: theme.spacing.unit,
        width: 160,
    },
    menu: {
        minWidth: 200,
    },
});

/**
 * @class
 */
class _Configuration extends Component {

    static defaultProps = {
        open: false,
        configuration: false,
        onUpdate: false,
    }

    /**
     * @type {{}}
     */
    state = {
        configuration: {}
    }

    /**
     * @type {{layout: string, input: string, resolution: number, leds: number}}
     */
    defaultConfiguration = {
        leds: Defaults.Leds,
        layout: Defaults.Layout,
        input: Defaults.Input,
        resolution: Defaults.Resolution,
        ranges: {},
        baud: Defaults.Baud,
        board: Defaults.Board
    }

    /*
     * @param success
     */
    handleClose = () => {
        const {onUpdate} = this.props;
        let configuration = this.state.configuration;

        if(configuration) {
            if(!configuration.id) configuration.id = uuid(); // issue new one
            configuration = {...this.defaultConfiguration, ...configuration};
        }
        onUpdate && onUpdate(configuration);
    };

    /**
     * @param prev
     */
    componentDidUpdate(prev) {
        if(this.props.configuration && (!prev.configuration || (prev.configuration.id != this.props.configuration.id))) {
            this.setState({configuration: this.props.configuration});
        }
    }

    /**
     * @param name
     * @param value
     */
    handleUpdate(name, value) {
        this.setState({configuration: {
            ...this.state.configuration,
            [name]: value
        }});
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, open, onCancel} = this.props;
        const {configuration} = this.state;
        const {name, layout, input, leds, resolution, baud, board} = {...this.defaultConfiguration,  ...configuration}

        return (
            <Dialog
                open={open}
            >
                <DialogTitle id="form-dialog-title">Configuration</DialogTitle>
                <DialogContent className={classes.root}>
                    <FormControl fullWidth className={classes.margin}>
                        <TextField
                            label="Name of Configuration"
                            value={name}
                            onChange={event => this.handleUpdate('name', event.target.value)}
                        />
                    </FormControl>
                    <Grid container spacing={24} className={classes.margin}>
                        <Grid item sm={6}>
                            <Dropdown
                                fullWidth
                                name="input"
                                label={"Input"}
                                items={Inputs}
                                value={input}
                                onChange={(value, name) => this.handleUpdate(name, value)}
                            />
                        </Grid>
                        <Grid item sm={6}>
                            <Dropdown
                                fullWidth
                                name="layout"
                                label={"Layout"}
                                items={Layouts}
                                value={layout}
                                onChange={(value, name) => this.handleUpdate(name, value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogContent>
                    <Grid container spacing={24} className={classes.margin}>
                        <Grid item sm={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="LEDs per Strand"
                                    value={leds}
                                    onChange={event => this.handleUpdate('leds', event.target.value)}
                                />
                                <FormHelperText id="weight-helper-text">The supported strand length is determined by the installed firmware.</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item sm={6}>
                            <Dropdown
                                fullWidth
                                name="resolution"
                                label={"Range Resolution"}
                                items={Resolutions}
                                value={resolution}
                                onChange={(value, name) => this.handleUpdate(name, value)}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={24} className={classes.margin}>
                        <Grid item sm={6}>
                            <Dropdown
                                fullWidth
                                name="board"
                                label={"Board"}
                                items={Boards}
                                value={board}
                                onChange={(value, name) => this.handleUpdate(name, value)}
                            />
                        </Grid>
                        <Grid item sm={6}>
                            <Dropdown
                                fullWidth
                                name="baud"
                                label={"Baud Rate"}
                                items={Bauds}
                                value={baud}
                                onChange={(value, name) => this.handleUpdate(name, value)}
                            />
                        </Grid>
                    </Grid>


                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={() => onCancel && onCancel()} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => this.handleClose()} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

/**
 * @export
 */
export default withStyles(styles)(_Configuration);