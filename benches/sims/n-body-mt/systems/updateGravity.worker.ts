import { CONSTANTS } from '../constants';
import { Component } from '@sweet-ecs/core';
import { updateGravity } from './updateGravity.common.js';

onmessage = updateGravity.worker(
	async ({
		entities,
		read: { Position, Mass },
		write: { Velocity, Acceleration },
		delta,
		world,
	}) => {
		const otherIds = world.query([Position, Mass, Velocity, Acceleration]);

		const velocities = Velocity.store;
		const masses = Mass.store;
		const accelerations = Acceleration.store;
		const positions = Position.store;

		for (let j = 0; j < entities.body.length; j++) {
			const meId = entities.body[j];
			accelerations.x[meId] = 0;
			accelerations.y[meId] = 0;

			for (let i = 0; i < otherIds.length; i++) {
				const currentId = otherIds[i];
				if (meId === currentId) continue; // Skip self

				const dx = +positions.x[currentId] - +positions.x[meId];
				const dy = +positions.y[currentId] - +positions.y[meId];
				let distanceSquared = dx * dx + dy * dy;

				if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

				const distance = Math.sqrt(distanceSquared);
				const forceMagnitude =
					(+masses.value[meId] * +masses.value[currentId]) / distanceSquared;

				accelerations.x[meId] += (dx / distance) * forceMagnitude;
				accelerations.y[meId] += (dy / distance) * forceMagnitude;
			}

			velocities.x[meId] += (accelerations.x[meId] * delta) / +masses.value[meId];
			velocities.y[meId] += (accelerations.y[meId] * delta) / +masses.value[meId];
		}
	}
);
