import { CONSTANTS } from '../constants';
import { IsCentralMass } from '../components/IsCentralMass';
import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Mass } from '../components/Mass';
import { Circle } from '../components/Circle';
import { Color } from '../components/Color';
import { Entity, World } from '@sweet-ecs/core';
import { Acceleration } from '../components/Acceleration';

let inited = false;

export const init = (world: World) => {
	for (let i = 0; i < CONSTANTS.NBODIES; i++) {
		const eid = Entity.in(world);

		Entity.add(Position, eid);
		Entity.add(Velocity, eid);
		Entity.add(Mass, eid);
		Entity.add(Circle, eid);
		Entity.add(Color, eid);
		Entity.add(Acceleration, eid);

		if (i === 0) {
			// Make the first entity the central mass.
			Entity.add(IsCentralMass, eid);
		}
	}

	inited = true;
};
