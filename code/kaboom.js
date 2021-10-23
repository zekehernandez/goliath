import kaboom from 'kaboom';
import { UNITS } from './constants';

// initialize context
const k = kaboom({ width: 32*UNITS, height: 18*UNITS, font: 'apl386', background: [48, 74, 70], stretch: true, letterbox: true });

export default k;
