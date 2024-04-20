import { Acceleration, Mass, Position, Velocity } from '../components';
import { ThreadedComponents } from '../utils/threading';
import { createDistributedSystem } from '../utils/createDistributedSystem';

export type UpdateGravityComponents = ThreadedComponents & {
	read: {
		Position: { x: Readonly<Float64Array>; y: Readonly<Float64Array> };
		Mass: { value: Readonly<Float64Array> };
	};
	write: {
		Acceleration: { x: Float64Array; y: Float64Array };
		Velocity: { x: Float64Array; y: Float64Array };
	};
};

export type UpdateGravityInput = {
	delta: number;
	partition: Uint32Array;
};

const body = [Position, Mass, Velocity, Acceleration];

export const updateGravity = createDistributedSystem({
	entities: { body },
	read: { Position, Mass },
	write: { Velocity, Acceleration },
	url: new URL('./updateGravity.worker.ts', import.meta.url),
	init: { queries: [body] },
});
