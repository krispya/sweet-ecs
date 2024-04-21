import { Acceleration, Mass, Position, Time, Velocity } from '../components';
import { createDistributedSystem } from '../utils/createDistributedSystem';

const body = [Position, Mass, Velocity, Acceleration];

export const updateGravity = createDistributedSystem({
	entities: { body },
	read: { Position, Mass, Time },
	write: { Velocity, Acceleration },
	url: new URL('./updateGravity.worker.ts', import.meta.url),
	init: { queries: [body] },
});
