import { Position } from '../components/Position';
import { Mass } from '../components/Mass';
import { CONSTANTS } from '../constants';
import { bodyQuery } from '../queries/queries';
import { World } from '@sweet-ecs/core';

export function computeGravitationalForce(
	world: World,
	meId: number
): { forceX: number; forceY: number } {
	const eids = bodyQuery(world);
	let forceX = 0;
	let forceY = 0;

	const positions = Position.store;
	const masses = Mass.store;

	for (let i = 0; i < eids.length; i++) {
		const currentId = eids[i];
		if (meId === currentId) continue; // Skip self

		const dx = positions.x[currentId] - positions.x[meId];
		const dy = positions.y[currentId] - positions.y[meId];
		let distanceSquared = dx * dx + dy * dy;

		if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

		const distance = Math.sqrt(distanceSquared);
		const forceMagnitude = (masses.value[meId] * masses.value[currentId]) / distanceSquared;

		forceX += (dx / distance) * forceMagnitude;
		forceY += (dy / distance) * forceMagnitude;
	}

	return { forceX, forceY };
}
