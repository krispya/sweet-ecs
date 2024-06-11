import { Velocity } from '../components/Velocity';
import { Mass } from '../components/Mass';
import { Acceleration } from '../components/Acceleration';
import { Position } from '../components/Position';
import { CONSTANTS } from '../constants';
import { World } from '@sweet-ecs/core';
import { Time } from '../components/Time';

export const updateGravity = ({ world }: { world: World }) => {
	const eids = world.query([Position, Mass, Acceleration, Velocity]);
	const { delta } = world.get(Time)!;

	const accelerations = Acceleration.getInstances();
	const velocities = Velocity.getInstances();
	const masses = Mass.getInstances();
	const positions = Position.getInstances();

	for (let j = 0; j < eids.length; j++) {
		const meId = eids[j];

		accelerations[meId].x = 0;
		accelerations[meId].y = 0;

		for (let i = 0; i < eids.length; i++) {
			const currentId = eids[i];
			if (meId === currentId) continue; // Skip self

			const dx = +positions[currentId].x - +positions[meId].x;
			const dy = +positions[currentId].y - +positions[meId].y;
			let distanceSquared = dx * dx + dy * dy;

			if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

			const distance = Math.sqrt(distanceSquared);
			const forceMagnitude = (+masses[meId].value * +masses[currentId].value) / distanceSquared;

			accelerations[meId].x += (dx / distance) * forceMagnitude;
			accelerations[meId].y += (dy / distance) * forceMagnitude;
		}

		// Apply computed force to entity's velocity, adjusting for its mass
		velocities[meId].x += (accelerations[meId].x * delta) / masses[meId].value;
		velocities[meId].y += (accelerations[meId].y * delta) / masses[meId].value;
	}
};
