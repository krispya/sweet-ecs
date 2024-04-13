import { defineSystem } from '@bitecs/classic';
import { bodyQuery } from '../queries/queries';
import { CONSTANTS } from '../constants';
import { Velocity } from '../components/Velocity';
import { Position } from '../components/Position';
import { World } from '../world';

export const moveBodies = defineSystem((world: World) => {
	const eids = bodyQuery(world);
	const { delta } = world.time;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		const position = Position.get(eid);
		const velocity = Velocity.get(eid);

		// Update position based on velocity and the global SPEED factor
		position.x += CONSTANTS.SPEED * velocity.x * delta;
		position.y += CONSTANTS.SPEED * velocity.y * delta;
	}

	return world;
});
