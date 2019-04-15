/**
 * @imports
 */
import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {Strands, Defaults} from "../../constants";

/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        zIndex: 2,
        userSelect: 'none',
        height: 30,
        width: 30,
        borderRadius: 5,
        margin: 2,
        position: 'relative'
    },

    strandLabel: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width:16,
      height:16,
      borderRadius: 15,
      color: '#fff',
      fontWeight: 'bold',
      lineHeight: '17px',
      fontSize: 14,
      letterSpacing: '-2px',
      paddingRight: 3
    },

    withGrid: {
        border:`1px solid ${theme.palette.secondary.main}`,
    },

    withSelected: {
        border:`1px solid ${theme.palette.secondary.dark}`,
    },

    withEdit: {
        cursor: 'pointer'
    },
});

/**
 * @class
 */
class _Led extends Component {

    static defaultProps = {
        id: false,
        led: {},
        group: false,
        edit: false,
        editStrand: false,
        withGrid: true,
        onUpdate: false,
        target: false,
    }

    /**
     * @type {{simulate: boolean, simulateState: boolean}}
     */
    state = {
        simulate: false,
        simulateState: false,
    };

    /**
     * @param props
     */
    constructor(props) {
        super(props);
        this.props.target && this.props.target(this);
    }

    /**
     * This is rather hard coded logic of the firmware
     * @param state
     */
    simulate(state, simulate) {

        const {led} = this.props;
        const {pattern, mirror} = led;

        if(mirror) {
            state = !state;
        }

        switch(pattern) {

            case 'blink':

                this.setState({simulate, simulateState: state});

                break;

            case 'strobe':

                this.setState({simulate, simulateState: state});

                break;

            default:
                if(this.state.simulate) {
                    this.setState({simulate: false, simulateState: false});
                }
                break;
        }


    }

    /**
     * @param event
     */
    handle(event) {
        const {id, led, edit, editStrand, onUpdate} = this.props;
        let {selected, strand} = led;
        let update = {...led, id}

        if(edit) {
            selected = selected && editStrand != led.strand ? selected : !selected;
            update = {...update, selected, strand: selected || (editStrand != strand) ? editStrand : false}
        } else if (selected) {
            // handle other stuff
        }

        onUpdate && onUpdate(update, event);
    }

    /**
     * render
     * @returns {*}
     */
    render() {

        const {classes, withGrid, edit, led} = this.props;
        let {strand, selected, index} = led;
        const {simulate, simulateState} = this.state;

        let labelStyles = {};

        if(strand) {
            labelStyles = {
                backgroundColor: Strands[strand].color
            }
        }

        const ledStyles = {
            backgroundColor: led.selected ?
                ( (simulate && simulateState) || !simulate ? (led.color || Defaults.LedColor) : 'transparent') : 'transparent',
        }


        return (
            <div
                className={[
                    classes.root,
                    withGrid ? classes.withGrid : '',
                    selected || edit ? classes.withEdit : '',
                    selected ? classes.withSelected : '',
                ].join(' ')}
                style={ledStyles}
                onClick={event => this.handle(event)}
            >
                {!strand ? null : (
                    <Typography
                        className={classes.strandLabel}
                        style={labelStyles}
                        align="center"
                    >
                        {index || index === 0 ? (index + 1) : ''}
                    </Typography>
                )}
            </div>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles)(_Led);