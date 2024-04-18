export {
	Circle,
	Position,
	Velocity,
	Acceleration,
	Time,
	Color,
	Mass,
	IsCentralMass,
	world,
} from '@sim/n-body-aos';

export { updateColor } from './systems/updateColor';
export { updateGravity } from './systems/updateGravity';
export { moveBodies } from './systems/moveBodies';
export { setInitial } from './systems/setInitial';
export { init } from './systems/init';
export { updateTime } from './systems/updateTime';
export { pipeline } from './systems/pipeline';
export { CONSTANTS } from './constants';
