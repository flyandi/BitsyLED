/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import LinearProgress from '@material-ui/core/LinearProgress';


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
class _WriteDialog extends Component {

    static defaultProps = {
        open: false,
        onClose: false,
        onRetry: false,
        info: [],
        completed: 0,
        buffer: 0,
        transfer: false,
        exception: false,
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, open, onClose, onRetry, transfer, completed, buffer, exception, expected, written} = this.props;

        return (
            <Dialog
                open={open}
            >
                <DialogTitle id="form-dialog-title">{transfer ? 'Uploading' : (exception ? 'Upload failed' : 'Upload completed')}</DialogTitle>
                <DialogContent className={classes.root}>
                    {transfer ? (
                        <LinearProgress variant="determinate" value={completed} />
                    ) : (
                        exception ? (
                            <Fragment>
                                <Typography>
                                    ({expected} bytes expected, {written} bytes written)
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    This can sometimes happen. Wait a couple seconds before retrying.
                                </Typography>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <Typography>
                                    Upload successfully.
                                </Typography>
                            </Fragment>
                        )
                    )}
                </DialogContent>
                <Divider />
                <DialogActions>
                    {!exception ? null : (
                        <Button onClick={() => onClose && onClose()} color="secondary">
                            Retry
                        </Button>
                    )}
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
export default withStyles(styles)(_WriteDialog);