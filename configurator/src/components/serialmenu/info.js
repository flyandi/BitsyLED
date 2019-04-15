/**
 * @imports
 */
import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {Boards} from "../../constants";
import {ObjectArray} from "../../lib";


/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        minWidth: 400,
    },
});

/**
 * @class
 */
class _InfoDialog extends Component {

    static defaultProps = {
        open: false,
        onClose: false,
        info: [],
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, open, onClose, info} = this.props;
        let {version} = info;
        version = version || 0;

        let board = false;
        ObjectArray(Boards).forEach(b => {
            if(b.fn == info.board) {
                board = b;
            }
        });

        let items = [
            {label: 'Board', text: board ? board.label : 'Unknown Board'},
            {label: 'Firmware Version', text: [Math.ceil(version / 100), Math.ceil(version % 100)].join('.')},
            {label: 'Free Memory', text: [info.memory || 0, 'bytes'].join(' ')},
            {label: 'Supported Ranges', text: [info.supportedNumRanges || 0].join(' ')},
            {label: 'Supported Strands per Range', text: [info.supportedNumStrands || 0].join(' ')},
            {label: 'Supported Leds per Strand', text: [info.supportedNumLeds || 0].join(' ')},
        ];

        return (
            <Dialog
                open={open}
            >
                <DialogTitle id="form-dialog-title">Board Info</DialogTitle>
                <DialogContent className={classes.root}>
                    <List className={classes.list}>
                        {items.map((item, index) =>
                            <ListItem key={index}>
                                <ListItemText primary={item.text} secondary={item.label}/>
                            </ListItem>
                        )}
                    </List>
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={() => onClose && onClose()} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

/**
 * @export
 */
export default withStyles(styles)(_InfoDialog);