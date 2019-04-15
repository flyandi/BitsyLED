/**
 * @imports
 */
import React, {Component, Fragment} from 'react';
import { withStyles } from '@material-ui/core/styles';
import {grey} from '@material-ui/core/colors';
import Typography from '@material-ui/core/Typography';


/**
 * Styles
 * @param theme
 * @returns {{}}
 */
const styles = theme => ({
    root: {
        backgroundColor: theme.palette.common.black,
        flexGrow: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
        height: 300,
        padding: theme.spacing.unit * 2,
        overflow: 'hidden',
        'overflow-y': 'scroll',
    },
    text: {
        color: grey[300],
        fontFamily: 'Courier',
        wordBreak: 'break-all',
    }
});

/**
 * @class
 */
class _SerialMessages extends Component {

    /**
     * render
     * @returns {*}
     */
    render() {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <Typography className={classes.text}>
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class
                    Serial Open\nblasadf.lksdlf;kasldfjasldfjlksadjflksacnlksadnvlksdanflkasndflkasfdlkasjdflkasjdflksajdf asd f;oasjf class

                </Typography>
            </div>
        );
    }
}

/**
 * @export
 */
export default withStyles(styles)(_SerialMessages);