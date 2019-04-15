/**
 * @imports
 */
import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import {green} from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MoreIcon from '@material-ui/icons/MoreVert';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {subscribe, setState, getState} from "../../data";
import {Defaults, Inputs, Events} from "../../constants";
import Menu from '../menu';
import {uuid} from "../../lib";
import {updateRange, removeRange, addRange} from "../../data/actions";

/**
 * @type {number}
 */
const ITEM_HEIGHT = 20;

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        height: theme.spacing.unit * ITEM_HEIGHT,
        backgroundColor: theme.palette.grey[50],
        border:`1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        overflow: 'hidden',
        boxShadow: `rgba(0, 0, 0, 0.15) 0 1px 5px`,
        paddingRight: theme.spacing.unit * 2,
        cursor: 'pointer',
    },
    program: {
        backgroundColor: theme.palette.secondary.light,
        height: theme.spacing.unit * ITEM_HEIGHT,
        paddingTop: theme.spacing.unit * 2,
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
class _Range extends Component {

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
            subscribe("serialChannelValue", channelValue => this.handleChange({channelValue}));
        });
    }

    /**
     * @param change
     */
    handleChange = values => {

        this.setState({
            ...values
        }, () => {
            const {configuration} = this.props;
            let {id, name, min, max, channelValue} = this.state;
            this.setState({channelSelected: channelValue >= min && channelValue <= max});
            if (!values.channelValue) {
                updateRange(configuration, {id: id || uuid(), name, min, max})
            }
        });
    }

    /**
     * @param event
     */
    handleEvent(e, event) {

        e.stopPropagation();
        e.preventDefault();

        const {configuration} = this.props;
        const {id, name} = this.state;

        switch(event) {
            case Events.Rename:
                setState({editRange: {range: {id, name}, onUpdate: range => {
                    Boolean(range) && this.handleChange(range);
                    setState({editRange: false});
                }}});
                break;
            case Events.Remove:
                removeRange(configuration, {id});
                break;
            case Events.Select:
                setState({selectedRange: id})
                break;
            case Events.Duplicate:
                addRange(configuration, getState().configurations[configuration.id].ranges[id]);
                break;
        }
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
        const {classes, theme, selected, configuration} = this.props;
        const {name, max, min, channelSelected, channelValue} = this.state;
        const input = Inputs[configuration.input || Defaults.Input];
        return (
            <Grid
                container
                className={[classes.root, selected ? classes.selected : ''].join(' ')}
                alignItems="center"
                justify="space-between"
                onClick={event => this.handleEvent(event, Events.Select)}
            >
                <Grid item className={[classes.program, channelSelected ? classes.channelSelected : ''].join(' ')} sm={3}>
                    <Grid container alignItems="center">
                        <Grid item lg>
                            <Typography align="center" variant="body1" color="textSecondary" className={classes.programText}>
                                {name}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item sm={7} className={classes.range}>
                    {!input.range ? null : (
                        <Slider.Range
                            dots
                            trackStyle={[
                                {backgroundColor: theme.palette.primary.main},
                                {backgroundColor: theme.palette.primary.main}
                            ]}
                            railStyle={{ backgroundColor: theme.palette.secondary.main }}
                            dotStyle={{borderColor: theme.palette.secondary.main}}
                            activeDotStyle={{borderColor: theme.palette.primary.main}}
                            handleStyle={[
                                {borderColor: theme.palette.primary.main},
                                {borderColor: theme.palette.primary.main}
                            ]}
                            min={input.range.min}
                            max={input.range.max}
                            marks={this.marks(input.range.marks, input.range)}
                            step={parseInt(configuration.resolution || Defaults.Resolution)}
                            value={[min, max]}
                            onChange={value => {
                                const [min, max] = value;
                                this.handleChange({min, max});
                            }}
                            onClick={e => e.stopPropgation()}
                        />
                    )}
                </Grid>
                <Grid item>
                    <Menu icon={<MoreIcon/>} menu={[
                        {label: 'Duplicate', fn: event => this.handleEvent(event, Events.Duplicate)},
                        {label: 'Rename', fn: event => this.handleEvent(event,  Events.Rename)},
                        {divider: true},
                        {label: 'Remove', fn: event => this.handleEvent(event, Events.Remove)}
                    ]} />
                </Grid>
            </Grid>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles, {withTheme: true})(_Range);