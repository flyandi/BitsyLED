/**
 * @imports
 */
import { blue, grey } from '@material-ui/core/colors'
import { createMuiTheme } from '@material-ui/core/styles';

/**
 * @export theme
 */
export default createMuiTheme({
    spacing: {
        unit: 5,
    },
    palette: {
        type: 'dark',
        primary: {
            main: blue[400]
        },
        secondary: {
            main: grey[300]
        },
    },
    typography: {
        useNextVariants: true,
        fontSize: 14,
    },
    props: {
        Range: {
            background: grey[700],
        },
        Grid: {
            color: grey[800],
            selected: grey[500],
        }
    }
});
