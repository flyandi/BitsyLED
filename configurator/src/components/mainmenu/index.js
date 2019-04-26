/**
 * @imports
 */
import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import SettingsIcon from '@material-ui/icons/Settings';
import AddIcon from '@material-ui/icons/Add';
import MenuIcon from '@material-ui/icons/Menu';
import FlyAndiLogo from '../../resources/flyandi-logo.svg';
import {setState} from "../../data";

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
        marginLeft: theme.spacing.unit * 4,
        marginRight: theme.spacing.unit * 2,
    }
});


/**
 * @class
 */
class _MainMenu extends Component {

    static defaultProps={
        onConfiguration: false,
        onBrowser: false,
        onAdd: false
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, onConfiguration, onBrowser, onAdd} = this.props;
        return (
            <Grid
                container
                className={classes.root}
                justify="space-between"
                alignItems="center"
            >
                <Grid item>
                    <Grid container alignItems="center">
                        <Grid item>
                            <IconButton onClick={() => onBrowser && onBrowser()}>
                                <MenuIcon/>
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <IconButton onClick={() => onAdd && onAdd()}>
                                <AddIcon/>
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <IconButton onClick={() => onConfiguration && onConfiguration()}>
                                <SettingsIcon/>
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item>
                    <Grid container alignItems="center">
                        <Grid item>
                            <img src={FlyAndiLogo} className={classes.logo} />
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
export default withStyles(styles)(_MainMenu);


/**
 @saveforlater
<Grid item>
    <Button variant="outlined" color="primary">
        Get Board
    </Button>
</Grid>
*/