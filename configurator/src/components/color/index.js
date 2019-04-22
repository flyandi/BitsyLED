/**
 * @imports
 */
import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import CloseIcon from '@material-ui/icons/Close';
import ColorPicker from 'material-ui-color-picker'
import Grid from '@material-ui/core/Grid';
import {Patterns, Speeds, Defaults} from "../../constants";
import {ObjectArray} from "../../lib";

/**
 * @type {number}
 */
const COLOR_ITEM = 30;

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        width: 400,
    },

    item: {
        padding: theme.spacing.unit * 4,
    },

    colorItem: {
        width: COLOR_ITEM,
        height: COLOR_ITEM,
        borderRadius: COLOR_ITEM,
        margin: theme.spacing.unit,
        cursor: 'pointer',
    },

    textField: {
        marginRight: theme.spacing.unit,
        width: 160,
    },
    menu: {
        width: 200,
    },

    options: {
        marginTop: theme.spacing.unit * 4,
    }
});

/**
 * @class
 */
class _Color extends Component {

    /**
     * @type {string[]}
     */
    colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFF00'];

    /**
     * @type {{}}
     */
    static defaultProps = {
        selectedAnchor: false,
        selectedLed: false,
        onUpdate: false,
        onClose: false,
    }

    /**
     * @type {{}}
     */
    state = {
        color: '#000000', // off
        pattern: Defaults.Pattern,
        mirror: false,
        speed: Defaults.Speed,
    }

    /**
     * @debounce
     */
    debounce = false;

    /**
     * @param event
     */
    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        }, () => this.update());
    };

    /**
     * @param event
     */
    handleChecked = name => event => {
        console.log(event.target.checked);
        this.setState({
            [name]: event.target.checked,
        }, () => this.update());
    };

    /**
     * Handle
     * @param event
     */
    update() {
        const {onUpdate, selectedLed} = this.props;
        let update = {...selectedLed, ...this.state};

        if(this.debounce) this.debounce = clearTimeout(this.debounce);
        this.debounce = setTimeout(() => onUpdate && onUpdate(update), 50);
    }

    /**
     * @param prevProps
     */
    componentDidUpdate(prevProps) {
        if (this.props.selectedLed && this.props.selectedLed.id !== prevProps.selectedLed.id) {
            this.setState({...this.props.selectedLed});
        }
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, selectedAnchor, selectedLed, onClose} = this.props;
        const {color, pattern, mirror, speed} = this.state;

        return (
            <Popper open={selectedLed ? true : false} anchorEl={selectedAnchor ? selectedAnchor : null}>
                <Paper>
                    <Grid container className={classes.root} direction="column">
                        <Grid item className={classes.item}>
                            <Typography gutterBottom>Color</Typography>
                            <Grid container item justify="space-between">
                                <Grid item>
                                    <Grid container>
                                        <Grid
                                            item
                                            className={classes.colorItem}
                                            style={{backgroundColor: color}}
                                        />
                                        <Grid item>
                                            <ColorPicker
                                                name='color'
                                                value={color}
                                                onChange={color => this.setState({color}, () => this.update())}
                                                disableColorLabel
                                                disableAlpha
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <IconButton onClick={() => onClose && onClose()}>
                                        <CloseIcon/>
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item>
                            <Divider />
                        </Grid>

                        <Grid item className={classes.item}>
                            <Typography gutterBottom>Basic Colors</Typography>
                            {this.renderColors(this.colors)}
                        </Grid>


                        <Grid item>
                            <Divider />
                        </Grid>

                        <Grid item className={classes.item}>
                            <Typography gutterBottom>Patterns</Typography>
                            <Grid container>
                                <Grid item>
                                    <TextField
                                        select
                                        className={classes.textField}
                                        SelectProps={{
                                            MenuProps: {
                                                className: classes.menu,
                                            },
                                        }}
                                        variant="outlined"
                                        value={pattern}
                                        onChange={this.handleChange('pattern')}
                                    >
                                        {ObjectArray(Patterns).map(pattern => (
                                            <MenuItem key={pattern.id} value={pattern.id}>
                                                {pattern.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        disabled={!(Patterns[pattern] || Defaults.Pattern).freq}
                                        select
                                        label="Frequency"
                                        className={classes.textField}
                                        SelectProps={{
                                            MenuProps: {
                                                className: classes.menu,
                                            },
                                        }}
                                        variant="outlined"
                                        value={speed}
                                        onChange={this.handleChange('speed')}
                                    >
                                        {ObjectArray(Speeds).map(speed => (
                                            <MenuItem key={speed.id} value={speed.id}>
                                                {speed.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>

                            <Grid item container className={classes.options}>
                                <Grid item sm={2}>
                                    <Switch
                                        checked={Boolean(mirror)}
                                        onChange={this.handleChecked('mirror')}
                                        color="primary"
                                    />
                                </Grid>
                                <Grid item sm={10}>
                                    <Typography>
                                        Mirror Cycle
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Use this option to create advanced patterns like left-right blinking.
                                    </Typography>
                                </Grid>
                            </Grid>

                        </Grid>
                    </Grid>
                </Paper>
            </Popper>
        );
    }

    /**
     * @param colors
     * @param variant
     * @returns {*}
     */
    renderColors(colors, variant = false) {
        const {classes} = this.props;
        return (
            <Grid container>
                {colors.map(color =>
                    <Grid
                        item
                        key={variant ? color[variant] : color}
                        className={classes.colorItem}
                        style={{backgroundColor: variant ? color[variant] : color}}
                        onClick={() => this.setState({color}, () => this.update())}
                    />
                )}
            </Grid>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles)(_Color);