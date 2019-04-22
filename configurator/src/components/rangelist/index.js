/**
 * @imports
 */
import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Range from '../range';
import {ObjectArray} from "../../lib";

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        height: 'calc(100%)',
        overflow: 'hidden',
        'overflow-y': 'scroll',
    },
    list: {
        padding: theme.spacing.unit,
    }
});

/**
 * @class
 */
class _RangeList extends Component {

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, configuration, selectedRange, onDelete} = this.props;
        const {ranges} = configuration;

        return (
            <div className={classes.root}>
                <Grid
                    container
                    direction="column"
                    spacing={8}
                    className={classes.list}
                >
                    {ObjectArray(ranges || {}).map(range =>
                        <Grid item key={range.id}>
                            <Range
                                selected={range.id == selectedRange}
                                range={range}
                                configuration={configuration}
                            />
                        </Grid>
                    )}
                </Grid>
            </div>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles)(_RangeList);