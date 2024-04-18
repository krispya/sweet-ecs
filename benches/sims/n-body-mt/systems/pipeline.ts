import { setInitial } from './setInitial';
import { moveBodies } from './moveBodies';
import { updateColor } from './updateColor';
import { Acceleration, Mass, Position, Velocity } from '../components';
import { updateGravityMain } from './updateGravity.main';
import { updateTime } from './time';
import { World } from '../world';

const updateGravity = updateGravityMain({
	entityQuery: [Position, Mass, Velocity, Acceleration],
	partitionQuery: [Position, Mass, Velocity, Acceleration],
	components: {
		read: { Position: Position.store, Mass: Mass.store },
		write: { Velocity: Velocity.store, Acceleration: Acceleration.store },
	},
});

export const pipeline = async (world: World) => {
	updateTime(world);
	setInitial(world);
	await updateGravity(world);
	moveBodies(world);
	updateColor(world);
};
