/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SerialMenu from './components/serialmenu';
import Browser from './components/browser';
import MainMenu from './components/mainmenu';
import RangeList from './components/rangelist';
import EditorMenu from './components/editormenu';
import Editor from './components/editor';
import Configuration from './components/configuration';
import RangeDialog from './components/rangedialog';
import Channel from './components/channel';
import {subscribe, setState, getState} from "./data";
import {addRange, addConfiguration, updateConfiguration, removeConfiguration} from "./data/actions";

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        height: 'calc(100%)',
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
    },
    menu: {
        boxShadow: theme.shadows[2],
        height: 'calc(100%)',
        zIndex: 2,
        backgroundColor: theme.palette.background.paper,
    },
    main: {
        zIndex: 1,
    }
});

/**
 * @component
 */
class _App extends Component {

    /**
     * @type {{}}
     */
    state = {
        openConfiguration: false,
        openBrowser: false,
        openRange: false,
        selectedConfiguration: false,
        selectedRange: false,
        configurations: false,
    };

    /**
     * @componentDidMount
     */
    componentDidMount() {
        subscribe("configurations", () => this.setState({configurations: getState().configurations}));
        subscribe("selectedConfiguration", selectedConfiguration => this.setState({selectedConfiguration}));
        subscribe("selectedRange", selectedRange => this.setState({selectedRange}));
        subscribe("editRange", editRange => this.setState({editRange}));
    }

    /**
     * @render
     * @returns {*}
     */
    render() {

        const {classes} = this.props;
        const {configurations, selectedConfiguration, selectedRange, channelValue, editRange, openConfiguration, openBrowser} = this.state;
        const hasEditRange = Boolean(editRange);
        const hasSelectedConfiguration = Boolean(selectedConfiguration);

        return (
            <Fragment>
                <Grid container className={classes.root}>
                    <Grid item sm={5}>
                        <Grid
                            container
                            direction="column"
                            className={classes.menu}
                        >
                            <Grid item>
                                <MainMenu
                                    onConfiguration={() => this.setState({openConfiguration: true})}
                                    onBrowser={() => this.setState({openBrowser: true})}
                                    onAdd={() => addRange(selectedConfiguration)}
                                />
                            </Grid>
                            <Grid item lg>
                                <RangeList
                                    selectedConfiguration={selectedConfiguration}
                                    selectedRange={selectedRange}
                                    channelValue={channelValue}
                                />
                            </Grid>
                            <Grid item>
                                <Channel
                                    selectedConfiguration={selectedConfiguration}
                                    channelValue={channelValue}
                                />
                            </Grid>
                            <Grid item>
                                <SerialMenu
                                    selectedConfiguration={selectedConfiguration}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sm={7} className={classes.main}>
                        {selectedRange ? (
                            <Fragment>
                                <EditorMenu />
                                <Editor
                                    selectedConfiguration={selectedConfiguration}
                                />
                            </Fragment>
                        ) : (
                            <Grid container alignItems="center" style={{height: '100%'}}>
                                <Grid item sm={12}>
                                    <Typography align="center" variant="body1" color="textSecondary">SELECT A RANGE</Typography>
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
                <Configuration
                    open={openConfiguration}
                    selectedConfiguration={selectedConfiguration}
                    onCancel={() => this.setState({openConfiguration: false})}
                    onUpdate={configuration => {
                        if(configuration) {
                            updateConfiguration(configuration);
                        }
                        this.setState({
                            openBrowser: false,
                            openConfiguration: false
                        });
                    }}
                />
                <RangeDialog
                    open={hasEditRange}
                    range={hasEditRange && editRange.range}
                    onUpdate={hasEditRange && editRange.onUpdate}
                />
                <Browser
                    configurations={configurations}
                    open={!hasSelectedConfiguration || openBrowser}
                    onSelect={selectedConfiguration => setState({selectedConfiguration})}
                    onAdd={preset => setState({selectedConfiguration: addConfiguration(preset)}, () => this.setState({openConfiguration: true}))}
                    onClose={() => this.setState({openBrowser: false})}
                    onDelete={id => {
                        setState({selectedConfiguration: false});
                        removeConfiguration(id);
                    }}
                />
            </Fragment>
        )
    }
}


/**
 * @export
 */
export default withStyles(styles)(_App);