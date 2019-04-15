/**
 * @imports
 */
import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import {green} from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {subscribe} from "../../data";
import {Defaults, Inputs} from "../../constants";

/**
 * @type {number}
 */
const ITEM_HEIGHT = 15;

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        padding: theme.spacing.unit * 4,
        height: theme.spacing.unit * ITEM_HEIGHT,
        backgroundColor: theme.palette.grey[50],
        borderTop:`1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        paddingRight: theme.spacing.unit * 2,
    },
    range: {
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
    },

    selected: {
        border:`1px solid ${theme.palette.primary.dark}`,
    },

    channelSelected: {
        backgroundColor: green[300],
    }
});



/**
 * @class
 */
class _Channel extends Component {

    /**
     * @type {{}}
     */
    static defaultProps = {
        configuration: false,
        selected: false,
        channelSelected: false,
        range: {},
    }

    /**
     * @state
     */
    state = {}

    /**
     * @componentDidMount
     */
    componentDidMount() {
        const {range} = this.props;
        this.setState({...range}, () => {
            subscribe("serialChannelValue", channelValue => this.setState({channelValue}));
        });
    }


    /**
     * @param marks
     */
    marks(marks, _r) {
        let r = {};
        marks.push(_r.max);
        marks.push(_r.min);
        marks.forEach(mark =>
            r[mark] = (
                <Typography variant="caption" color="textSecondary">{mark}</Typography>
            )
        );
        return r;
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {channelValue} = this.state;
        //if(channelValue === false) return null;

        const {classes, theme, selected, configuration} = this.props;
        const input = Inputs[configuration.input || Defaults.Input];

        return (
            <Grid
                container
                className={[classes.root, selected ? classes.selected : ''].join(' ')}
                alignItems="center"
                justify="space-between"
            >
                <Grid item sm={10} className={classes.range}>
                    {!input.range ? null : (
                        <Slider.Range
                            dots
                            disabled
                            trackStyle={[
                                {backgroundColor: theme.palette.primary.main},
                                {backgroundColor: theme.palette.primary.main}
                            ]}
                            railStyle={{ backgroundColor: theme.palette.secondary.main }}
                            dotStyle={{borderColor: theme.palette.secondary.main}}
                            activeDotStyle={{backgroundColor: theme.palette.primary.main, borderColor: theme.palette.primary.main}}
                            handleStyle={[
                                {backgroundColor: theme.palette.primary.main, borderColor: theme.palette.primary.main},
                                {backgroundColor: theme.palette.primary.main, borderColor: theme.palette.primary.main}
                            ]}
                            min={input.range.min}
                            max={input.range.max}
                            marks={this.marks(input.range.marks, input.range)}
                            step={parseInt(Defaults.Resolution)}
                            value={[channelValue || 0]}
                        />
                    )}
                </Grid>
                <Grid item m={10}>
                    <Typography variant="h5" color="textSecondary">{(channelValue || 0)}</Typography>
                </Grid>
            </Grid>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles, {withTheme: true})(_Channel);