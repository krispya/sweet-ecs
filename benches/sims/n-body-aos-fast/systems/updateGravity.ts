import { bodyQuery } from '../queries/queries';
import { Velocity } from '../components/Velocity';
import { Mass } from '../components/Mass';
import { World } from '../world';
import { Acceleration } from '../components/Acceleration';
import { Position } from '../components/Position';
import { CONSTANTS } from '../constants';

export const updateGravity = (world: World) => {
	const eids = bodyQuery(world);
	const { delta } = world.time;

	const velocities = Velocity.instances;
	const masses = Mass.instances;
	const accelerations = Acceleration.instances;
	const positions = Position.instances;

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
