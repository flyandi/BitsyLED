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
        type: 'light',
        primary: {
            main: blue[600]
        },
        secondary: {
            main: grey[300]
        },
    },
    typography: {
        useNextVariants: true,
        fontSize: 14,
    }
});
