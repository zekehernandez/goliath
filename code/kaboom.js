import kaboom from 'kaboom';
import { UNITS } from './constants';

// initialize context
const k = kaboom({ width: 32*UNITS, height: 18*UNITS, font: 'apl386', letterbox: true, stretch: true });

export default k;
