/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
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
import {Layouts, Inputs, Resolutions} from "../../constants";



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
class _RangeDialog extends Component {

    static defaultProps = {
        open: false,
        range: false,
        onUpdate: false,
    }

    /**
     * @type {{}}
     */
    state = {
        range: {}
    }

    /**
     * @param prev
     */
    componentDidUpdate(prev) {
        if(this.props.range && (!prev.range || (prev.range.id != this.props.range.id))) {
            this.setState({range: this.props.range});
        }
    }

    /**
     * @param name
     * @param value
     */
    handleUpdate(name, value) {
        this.setState({range: {
            ...this.state.range,
            [name]: value
        }});
    }

    /**
     * @param success
     */
    handleClose = (success) => {
        const {onUpdate} = this.props;
        const range = success ? this.state.range : false;
        onUpdate && onUpdate(range);
    };


    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, open} = this.props;
        const {range} = this.state;
        const {name} = range;

        return (
            <Dialog
                open={open}
                onClose={() => this.handleClose(false)}
            >
                <DialogTitle id="form-dialog-title">Range Settings</DialogTitle>
                <DialogContent className={classes.root}>
                    <FormControl fullWidth className={classes.margin}>
                        <TextField
                            label="Name of Range"
                            value={name}
                            onChange={event => this.handleUpdate('name', event.target.value)}
                        />
                    </FormControl>

                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={() => this.handleClose(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => this.handleClose(true)} color="primary">
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
export default withStyles(styles)(_RangeDialog);