/**
 * @imports
 */
import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import EditIcon from '@material-ui/icons/Edit';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import GridIcon from '@material-ui/icons/GridOff';
import GridOnIcon from '@material-ui/icons/GridOn';
import ShapeIcon from '@material-ui/icons/BlurOff';
import ShapeOnIcon from '@material-ui/icons/BlurOn';
import {Strands, Presets} from "../../constants";
import {setState, getState, subscribe} from "../../data";
import {ObjectArray} from "../../lib";
import Menu from '../menu';

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        padding: `${theme.spacing.unit * 3}px ${theme.spacing.unit * 4}px`,
        flexGrow: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    grow: {
        flexGrow: 1,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 150,
    },
    menu: {
        width: 200,
    },
    logo: {
        height: 30,
        opacity: 0.5,
        marginRight: theme.spacing.unit * 2,
    },
    strand: {
        margin: 5,
        height: 35,
        width: 35,
        borderRadius: 30,
        cursor: 'pointer',
        borderWidth: 3,
        borderStyle: 'solid',
    },
    strandLabel: {
        opacity: 0.25,
        textAlign: 'center',
    }
});


/**
 * @class
 */
class _EditorMenu extends Component {


    /**
     * @state
     */
    state = {
        ...getState(),
        simulate: false
    }

    /**
     * @param event
     */
    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    /**
     * @componentDidMount
     */
    componentDidMount() {
        subscribe("simulate", simulate => {this.setState({simulate})})
    }

    clear(strands) {
        if(!strands) strands = [Strands.l, Strands.o, Strands.r];
        if(strands.constructor != Array) strands = [strands];
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes} = this.props;
        const {enableGrid, enableLayout, enableEditStrand, selectedStrand, simulate} = this.state;

        return (
            <Grid
                container
                className={classes.root}
                justify="space-between"
                alignItems="center"
            >
                <Grid item>
                    <Grid container>
                        <Grid item>
                            <IconButton
                                onClick={() => this.setState({enableGrid: !enableGrid}, () => {
                                    setState({enableGrid: this.state.enableGrid});
                                })}
                            >
                                {!enableGrid ? <GridOnIcon/> : <GridIcon/>}
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <IconButton
                                onClick={() => this.setState({enableLayout: !enableLayout}, () => {
                                    setState({enableLayout: this.state.enableLayout});
                                })}
                            >
                                {!enableLayout ? <ShapeOnIcon/> : <ShapeIcon/>}
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <IconButton
                                color={enableEditStrand ? "primary" : "default"}
                                onClick={() => this.setState({enableEditStrand: !enableEditStrand}, () => {
                                    setState({enableEditStrand: this.state.enableEditStrand});
                                })}
                            >
                                <EditIcon />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            {!enableEditStrand ? null : (
                                <Grid container alignItems="center">
                                    {ObjectArray(Strands).map(strand =>
                                        <Grid
                                            item
                                            key={strand.id}
                                            className={classes.strand}
                                            style={{
                                                borderColor: selectedStrand == strand.id ? strand.selectedColor : strand.color,
                                                backgroundColor: strand.color
                                            }}
                                            onClick={() => this.setState({selectedStrand: strand.id}, () => {
                                                setState({selectedStrand: this.state.selectedStrand});
                                            })}
                                        >
                                            <Typography align="center" variant="h5"
                                                        className={classes.strandLabel}>{strand.short}</Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item>
                    <Grid container alignItems="center">
                        <Grid item>
                            <IconButton onClick={() => this.setState({simulate: !simulate}, () => {
                                setState({simulate: this.state.simulate});
                            })}>
                                {simulate ? <StopIcon/> : <PlayIcon/>}
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles)(_EditorMenu);

/**
 *  <Grid item>
 <Menu icon={<MoreIcon/>} menu={[
                                {label: 'Clear Left Strand', fn: event => this.clear(Strands.l)},
                                {label: 'Clear Right Strand', fn: event => this.clear(Strands.r)},
                                {label: 'Clear Other Strand', fn: event => this.clear(Strands.o)},
                                {divider: true},
                                {label: 'Clear All', fn: event => this.clear()},
                            ]} />
 </Grid>
 */
