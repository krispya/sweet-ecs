import { Velocity } from '../components/Velocity';
import { Mass } from '../components/Mass';
import { Acceleration } from '../components/Acceleration';
import { Position } from '../components/Position';
import { CONSTANTS } from '../constants';
import { World } from '@sweet-ecs/core';
import { Time } from '../components/Time';

export const updateGravity = ({ world }: { world: World }) => {
	const eids = world.query([Velocity, Mass, Position]);
	const { delta } = world.get(Time)!;

	const velocities = Velocity.store;
	const masses = Mass.store;
	const accelerations = Acceleration.store;
	const positions = Position.store;

	for (let j = 0; j < eids.length; j++) {
		const meId = eids[j];
		accelerations.x[meId] = 0;
		accelerations.y[meId] = 0;

		for (let i = 0; i < eids.length; i++) {
			const currentId = eids[i];
			if (meId === currentId) continue; // Skip self

			const dx = +positions.x[currentId] - +positions.x[meId];
			const dy = +positions.y[currentId] - +positions.y[meId];
			let distanceSquared = dx * dx + dy * dy;

			if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

			const distance = Math.sqrt(distanceSquared);
			const forceMagnitude = (+masses.value[meId] * +masses.value[currentId]) / distanceSquared;

			accelerations.x[meId] += (dx / distance) * forceMagnitude;
			accelerations.y[meId] += (dy / distance) * forceMagnitude;
		}

		// Apply computed force to entity's velocity, adjusting for its mass
		velocities.x[meId] += (accelerations.x[meId] * delta) / masses.value[meId];
		velocities.y[meId] += (accelerations.y[meId] * delta) / masses.value[meId];
	}
};
