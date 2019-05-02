import {setState, getState, INITIAL} from "../../data";
import {InternalLinks} from "../../constants";

export default [
    {label: 'Dark Mode', text: 'Turn to the dark side', name: 'darkMode'},
    {label: 'Serial Monitor', text: 'Turn on some debugging tools', name: 'serialMonitor'},
    {label: 'Need a Board?', text: 'Get the official BitsyLED board', button: 'Buy', link: InternalLinks.BoardLink},
    {label: 'Support this Project!', text: 'Yes it is open source and you can contribute, too.', button: 'GitHub', link: InternalLinks.GitHub},
    {label: 'Issues?', text: 'Warning: This will reset everything.', button: 'Reset', press: () => {
        setState(INITIAL);
    }},
]