/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import {ObjectArray} from "../../lib";



/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    textField: {
        marginRight: theme.spacing.unit,
    },
    menu: {
        minWidth: 200,
    },
});

/**
 * @class
 */
class _Dropdown extends Component {

    static defaultProps = {
        name: false,
        label: false,
        value: false,
        onChange: false,
        hint: false,
        items: {},
        fullWidth: false,
        variant: 'standard',
    }

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes, value, label, items, fullWidth, hint, variant, name, onChange} = this.props;

        return (
            <FormControl fullWidth={fullWidth}>
                <TextField
                    select
                    label={label}
                    SelectProps={{MenuProps: {className: classes.menu}}}
                    value={value}
                    variant={variant}
                    onChange={event => onChange && onChange(event.target.value, name)}
                >
                    {ObjectArray(items).map(item => (
                        <MenuItem key={item.id} value={item.id}>
                            {item.label}
                        </MenuItem>
                    ))}
                </TextField>
                {!hint ? null : (
                    <FormHelperText>{hint}</FormHelperText>
                )}
            </FormControl>
        )
    }
}

/**
 * @export
 */
export default withStyles(styles)(_Dropdown);