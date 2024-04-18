import { colorFromSpeed } from '../utils/colorFromSpeed';
import { World } from '@sweet-ecs/core';
import { Velocity, Color } from '@sim/n-body-aos';

export const updateColor = (world: World) => {
	const eids = world.query([Velocity, Color]);

	const velocities = Velocity.instances;
	const colors = Color.instances;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];

		const speed = Math.sqrt(velocities[eid].x ** 2 + velocities[eid].y ** 2);
		const { r, g, b, a } = colorFromSpeed(speed);

		colors[eid].r = r;
		colors[eid].g = g;
		colors[eid].b = b;
		colors[eid].a = a;
	}

	return world;
};
