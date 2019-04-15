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
import {Inputs, Layouts, Defaults, VERSION} from "../../constants";
import BitsyLedLogo from '../../resources/bitsyled.png';
import Settings from './settings';


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
        tab: false,
    }

    state = {
        tab: 0,
    }

    /**
     * @param selection
     */
    handleSelect(selection) {
        const {onSelect, onClose} = this.props;
        onSelect && onSelect(selection);
        onClose && onClose();
    }

    /**
     * @param event
     * @param value
     */
    handleChange = (event, tab) => {
        this.setState({ tab });
    };

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
                onClose={() => this.handleClose(false)}
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

    renderContent(tab) {

        const {configurations, classes} = this.props;

        switch(tab) {

            case 0:
                return this.renderList(configurations);
            case 1:
                return null;
            default:
                return (
                    <Fragment>
                        <List className={classes.list}>
                            {Settings.map((item, index) =>
                                <ListItem key={index}>
                                    <ListItemText primary={item.label} secondary={item.text}/>
                                    <ListItemSecondaryAction>
                                        {item.button ? (
                                            <Button onClick={() => window.open(item.link)} variant="outlined"
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
                                <img src={BitsyLedLogo} style={{height: 100}} />
                            </Grid>
                            <Grid item style={{marginLeft: 20}}>
                                <Typography gutterBottom variant="h5" color="textSecondary">BitsyLED Configurator</Typography>
                                <Typography color="textSecondary">Configurator {VERSION}</Typography>
                                <Typography>Made by Andy Schwarz (<a target="_blank" href="http://flyandi.net">flyandi.net</a>)</Typography>
                                <Typography>Licensed under GPLv3.</Typography>
                            </Grid>
                        </Grid>
                    </Fragment>

                )
        }
    }

    renderList(items) {

        const {classes} = this.props;

        return (
                <List className={classes.items}>
                {ObjectArray(items).map(item => {
                    return (<ListItem key={item.id} button onClick={() => this.handleSelect(item)}>
                        <ListItemText primary={item.name} secondary={
                            [
                                Inputs[item.input || Defaults.Input].label,
                                Layouts[item.layout || Defaults.Layout].label,
                            ].join(" · ")
                        }/>
                        <ListItemSecondaryAction>
                            <Menu icon={<MoreIcon/>} menu={[
                                {label: 'Settings',},
                                {label: 'Duplicate'},
                                {divider: true},
                                {label: 'Delete'},
                            ]}/>
                        </ListItemSecondaryAction>
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