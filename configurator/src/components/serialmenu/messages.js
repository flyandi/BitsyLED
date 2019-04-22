/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import {grey} from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        backgroundColor: theme.palette.common.black,
        flexGrow: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
        height: 300,
        overflow: 'hidden',
    },
    buttons: {
        padding: theme.spacing.unit * 2,
    },
    list: {
        padding: theme.spacing.unit * 2,
        display: 'flex',
        flex: 1,
        'overflow-y': 'scroll',
    },
    text: {
        color: grey[300],
        fontFamily: 'Courier',
        wordBreak: 'break-all',
    }
});

/**
 * @class
 */
class _SerialMessages extends Component {

    state = {
        buffer: ['BitsyLED!'],
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes} = this.props;

        return (
            <Grid container className={classes.root} direction="column">
                <Grid item className={classes.buttons}>
                    <Button variant="outlined" size="small" onClick={() => this.setState({buffer: []})}>Clear</Button>
                </Grid>
                <Grid className={classes.list} lg>
                    {this.state.buffer.map((t, k) =>
                        <Typography key={k} className={classes.text}>{t}</Typography>
                    )}
                </Grid>
            </Grid>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles)(_SerialMessages);