/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';

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

});

/**
 * @class
 */
class _Menu extends Component {

    /**
     * @type {{button: (function(*, *): *), icon: boolean}}
     */
    static defaultProps = {
        button: (icon, props) => <IconButton {...props}>{icon}</IconButton>,
        icon: false,
        menu: [],
        onSelect: false,
    }

    /**
     * @type {{anchorEl: null}}
     */
    state = {
        anchorEl: null,
    }

    /**
     * @param event
     */
    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    /**
     * @void
     */
    handleClose = item => event => {
        this.setState({ anchorEl: null });
        if(item) {
            item.fn && item.fn(event) || (this.props.onSelect && this.props.onSelect(item, event));
        }
    };

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, menu, button, icon} = this.props;
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);

        return (
            <Fragment>
                {button(icon, {
                    onClick: this.handleClick
                })}
                <Menu
                    disableAutoFocusItem
                    anchorEl={anchorEl}
                    open={open}
                    onClose={this.handleClose(false)}
                    PaperProps={{
                        style: {
                            width: 200,
                        },
                    }}
                >
                    {menu.map((item, key) =>
                        item.divider ? <Divider key={key} /> : (
                            <MenuItem key={key} onClick={this.handleClose(item)}>
                                {item.label}
                            </MenuItem>
                        )
                    )}
                </Menu>
            </Fragment>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles, {withTheme: true})(_Menu);