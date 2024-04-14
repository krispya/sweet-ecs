import { setInitial } from './setInitial';
import { moveBodies } from './moveBodies';
import { updateColor } from './updateColor';
import { bodyQuery } from '../queries/bodyQuery';
import { Acceleration, Mass, Position, Velocity } from '../components';
import { updateGravityMain } from './updateGravity.main';
import { updateTime } from './time';
import { World } from '../world';

const updateGravity = updateGravityMain({
	queries: { bodyQuery },
	partitionQuery: bodyQuery,
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
