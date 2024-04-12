import { CONSTANTS } from '../constants';
import { Entity } from '@sweet-ecs/core';
import { WorldMT } from '../world';
import { Circle, Color, IsCentralMass, Mass, Position, Velocity } from '..';

export const init = (world: WorldMT) => {
	for (let i = 0; i < CONSTANTS.NBODIES; i++) {
		const eid = Entity.in(world);

		Entity.add(Position, eid);
		Entity.add(Velocity, eid);
		Entity.add(Mass, eid);
		Entity.add(Circle, eid);
		Entity.add(Color, eid);

		if (i === 0) {
			// Make the first entity the central mass.
			Entity.add(IsCentralMass, eid);
		}
	}
};
