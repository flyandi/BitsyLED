/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import MoreIcon from '@material-ui/icons/MoreVert';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Switch from '@material-ui/core/Switch';
import Menu from '../menu';
import {ObjectArray} from "../../lib";
import {getState, setState} from "../../data";
import {Inputs, Layouts, Defaults, VERSION, InternalLinks, Events} from "../../constants";
import Logo from '../../resources/icon.png';
import Settings from './settings';
import Presets from '../../resources/presets';
import {addRange, removeRange} from "../../data/actions";


/**
 * @native-imports
 */
const shell = window.require("electron").shell;

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    content: {
        height: 500,
    },
    header: {
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit}px`,
        paddingLeft: theme.spacing.unit * 3,
    },
    tabs: {
        borderBottom: `1px solid ${theme.palette.divider}`
    },
    items: {
        height: 500,
    },
    list: {

        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit * 4,
    },
    panel: {
        padding: theme.spacing.unit * 4
    },
    secondPanel: {
        padding: theme.spacing.unit * 4,
        paddingTop: 0,
    },
});

/**
 * @class
 */
class _Browser extends Component {

    /**
     * @type {{}}
     */
    static defaultProps = {
        configurations: {},
        open: false,
        range: false,
        onUpdate: false,
        onAdd: false,
        onSelect: false,
        onClose: false,
        onRemove: false,
        tab: false,
    }

    state = {
        tab: 0,
    }

    /**
     * @param selection
     */
    handleSelect(selection, preset) {
        const {onSelect, onClose, onAdd} = this.props;
        if(preset) {
           onAdd && onAdd(selection);
        } else {
            onSelect && onSelect(selection.id);
        }
        onClose && onClose();
    }

    /**
     * @param event
     * @param value
     */
    handleChange = (event, tab) => {
        this.setState({ tab });
    }

    /**
     * @param event
     */
    handleEvent(e, id, event) {

        e.stopPropagation();
        e.preventDefault();

        const {onDelete} = this.props;

        switch(event) {
            case Events.Remove:
                onDelete && onDelete(id);
                break;
            case Events.Duplicate:
                //addRange(selectedConfiguration, getState().configurations[selectedConfiguration].ranges[id]);
                break;
        }
    }

    /**
     * @param item
     */
    open(item) {
        if(item.link) {
            return shell.openExternal(item.link);
        }
        if(item.press) {
            return item.press();
        }
    }


    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, open, onAdd, onClose} = this.props;
        const {tab} = this.state;

        return (
            <Dialog
                open={open}
            >
                <Grid container justify="space-between" alignItems="center" className={classes.header}>
                    <Grid item>
                        <Typography variant="h6">
                            BitsyLED
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Grid container>
                            <Grid item>
                                <IconButton onClick={() => onAdd && onAdd()}>
                                    <AddIcon/>
                                </IconButton>
                            </Grid>
                            <Grid item>
                                <IconButton onClick={() => onClose && onClose()}>
                                    <CloseIcon/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Tabs
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    className={classes.tabs}
                    onChange={this.handleChange}
                    value={tab}
                >
                    <Tab label="Configurations" />
                    <Tab label="Presets" />
                    <Tab label="Settings" />
                </Tabs>

                <div className={classes.content}>
                    {this.renderContent(tab)}
                </div>
            </Dialog>
        )
    }

    /**
     * @param tab
     * @returns {*}
     */
    renderContent(tab) {

        const {configurations, classes} = this.props;

        switch(tab) {
            case 0:
                return this.renderList(configurations);
            case 1:
                return this.renderList(Presets, true);
            default:
                return (
                    <Fragment>
                        <List className={classes.list}>
                            {Settings.map((item, index) =>
                                <ListItem key={index}>
                                    <ListItemText primary={item.label} secondary={item.text}/>
                                    <ListItemSecondaryAction>
                                        {item.button ? (
                                            <Button onClick={() => this.open(item)} variant="outlined"
                                                    color="primary">{item.button}</Button>
                                        ) : (
                                            <Switch
                                                color="primary"
                                                checked={this.state[item.name] || getState()[item.name]}
                                                onChange={event => {
                                                    setState({[item.name]: event.target.checked}, () => {
                                                        this.setState({[item.name]: event.target.checked});
                                                    });
                                                }}
                                            />
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )}
                        </List>
                        <Divider />
                        <Grid container className={classes.panel}>
                            <Grid item>
                                <img src={Logo} style={{height: 100}} />
                            </Grid>
                            <Grid item style={{marginLeft: 20}}>
                                <Typography gutterBottom variant="h5" color="textSecondary">BitsyLED Configurator</Typography>
                                <Typography color="textSecondary">Configurator {VERSION}</Typography>
                                <Typography>Hacked together by Andy "FLY&I" Schwarz</Typography>
                                <Typography>Licensed under GPLv3</Typography>
                            </Grid>
                        </Grid>
                    </Fragment>

                )
        }
    }

    /**
     * @param items
     * @param preset
     * @returns {*}
     */
    renderList(items, preset = false) {

        const {classes} = this.props;

        return (
                <List className={classes.items}>
                {ObjectArray(items).map(item => {
                    return (<ListItem key={item.id} button onClick={() => this.handleSelect(item, preset)}>
                        <ListItemText primary={item.name} secondary={
                            [
                                Inputs[item.input || Defaults.Input].label,
                                Layouts[item.layout || Defaults.Layout].label,
                            ].join(" · ")
                        }/>
                        {preset ? null : (
                            <ListItemSecondaryAction>
                                <Menu icon={<MoreIcon/>} menu={[
                                    {label: 'Duplicate', fn: event => this.handleEvent(event, item.id, Events.Duplicate)},
                                    {divider: true},
                                    {label: 'Remove', fn: event => this.handleEvent(event, item.id, Events.Remove)}
                                ]} />
                            </ListItemSecondaryAction>
                        )}
                    </ListItem>)
                })}
            </List>
        );
    }


}

/**
 * @export
 */
export default withStyles(styles)(_Browser);