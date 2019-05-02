/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Led from '../led';
import Color from '../color';
import {Layouts, Defaults, Speeds} from "../../constants";
import {subscribe, getState} from "../../data";
import {ObjectArray} from "../../lib";
import {getConfiguration, updateLed} from "../../data/actions";

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        paddingTop: theme.spacing.unit * 3,
        zIndex: 1,
        position: 'relative',
    },
    layout: {
        zIndex: 0,
        position: 'absolute',
        opacity: 0.25
    }
});

/**
 * @class
 */
class _Editor extends Component {

    static defaultProps = {
        selectedConfiguration: false,
        width: 20,
        height: 20,
    }

    /**
     * @type {{}}
     */
    state = {
        ...getState(),
        selectedLed: false,
        selectedAnchor: false,
    }

    /**
     * @type {Array}
     */
    simulateStates = {};
    simulationItems = {};
    simulationTimers = [];
    simulationTargets = {};

    /**
     * @param props
     */
    constructor(props) {
        super(props);
    }

    /**
     * @componentDidMount
     */
    componentDidMount() {
        subscribe("enableGrid", enableGrid => this.setState({enableGrid}));
        subscribe("enableLayout", enableLayout => this.setState({enableLayout}));
        subscribe("enableEditStrand", enableEditStrand => this.setState({enableEditStrand}));
        subscribe("selectedStrand", selectedStrand => this.setState({selectedStrand}));
        subscribe("selectedRange", selectedRange => {this.reset(selectedRange)});
        subscribe("simulate", simulate => this.setState({simulate}, () => this.simulator()));
    }

    /**
     * @simulator
     */
    simulator() {
        const {simulate} = this.state;

        if(this.simulationTimers.length) {
            this.simulationTimers.forEach(item => clearInterval(item));
        }

        ObjectArray(Speeds).map(speed => this.simulationTimers.push(setInterval(() => {
           this.simulateStates[speed.id] = !this.simulateStates[speed.id];
           if(this.simulationItems[speed.id] && this.simulationItems[speed.id].length) {
               this.simulationItems[speed.id].forEach(led =>
                   this.simulationTargets[led] && this.simulationTargets[led].simulate(this.simulateStates[speed.id], simulate)
               );
           }
        }, speed.ms)));
    }

    /**
     * @param selectedRange
     */
    reset(selectedRange) {

        const {selectedConfiguration, width, height} = this.props;
        const configuration = getConfiguration(selectedConfiguration);

        let leds = {};
        for(let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                leds[[y, x].join('.')] = false;
            }
        }

        leds = {...leds, ...((configuration && selectedRange ? configuration.ranges[selectedRange].leds : false) || {})}

        return this.setState({
            selectedRange,
            ...leds,
        });
    }


    /**
     * @param c
     * @returns {number}
     */
    findNextIndex(led) {

        const {selectedConfiguration} = this.props;
        const configuration = getConfiguration(selectedConfiguration);
        let indexes = [];

        ObjectArray(this.state).forEach(l => {
           if(l.id != led.id && l.strand === led.strand && (l.index || l.index === 0)) {
               indexes.push(l.index);
           }
        });

        if(indexes.length >= configuration.leds) return false; // too many
        if(!indexes.length) return 0;
        indexes.sort((a, b) => a -b);

        for(let x = 0; x < indexes.length; x++) {
            if(indexes[x] !== x) return x;
        }

        return indexes.length;
    }


    /**
     * @param led
     */
    handleLed(led, event) {
        const {selectedAnchor, enableEditStrand} = this.state;

        if(enableEditStrand) {
            led.index = this.findNextIndex(led);
        }

        if (led.index === false) return false; // too many

        this.setState({
            selectedLed: !enableEditStrand && led.selected ? led : false,
            selectedAnchor: !event && selectedAnchor ? selectedAnchor : (!enableEditStrand && led.selected ? event.currentTarget : false),
        });

        this.updateLed(led);
    }

    /**
     * @param led
     */
    updateLed(led) {

        const {selectedConfiguration} = this.props;
        const {selectedRange} = this.state;
        if(!selectedRange) return;


        this.setState({[led.id]: led}, () => {
            updateLed(selectedConfiguration, selectedRange, led);
        });

        // update simulators
        this.simulationItems = {};

        ObjectArray(this.state).forEach(l => {
            if(!this.simulationItems[l.speed]) this.simulationItems[l.speed] = [];
            this.simulationItems[l.speed].push(l.id);
        });
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, width, height, selectedConfiguration} = this.props;
        if(!selectedConfiguration) return null;

        const {enableGrid, enableLayout, enableEditStrand, selectedStrand, selectedLed, selectedAnchor} = this.state;
        const configuration = getConfiguration(selectedConfiguration);
        const layout = Layouts[(configuration.layout || Defaults.Layout)];

        let grid = [];
        for(let y = 0; y < height; y++) {
            let rows = [];
            for(let x = 0; x < width; x++) {
                const ledid = [y, x].join('.');
                rows.push(
                    <Grid key={ledid} item>
                        <Led
                            target={ref => this.simulationTargets[ledid] = ref}
                            id={ledid}
                            withGrid={enableGrid}
                            edit={enableEditStrand}
                            editStrand={selectedStrand}
                            led={this.state[ledid]}
                            onUpdate={(led, event) => this.handleLed(led, event)}
                        />
                    </Grid>
                )
            }
            grid.push(
                <Grid item key={y} >
                    <Grid container>
                        {rows}
                    </Grid>
                </Grid>
            );
        }


        return (
            <Fragment>
                <Grid container direction="column" justify="center" alignItems="center" className={classes.root}>
                    {!enableLayout ? null : (
                        <img className={classes.layout} style={layout.shapeStyles} src={layout.shape} />
                    )}
                    {grid}
                </Grid>
                <Color
                    selectedLed={selectedLed}
                    selectedAnchor={selectedAnchor}
                    onUpdate={led => this.updateLed(led)}
                    onClose={() => this.setState({selectedLed: false, selectedAnchor: false})}
                />
            </Fragment>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles)(_Editor);