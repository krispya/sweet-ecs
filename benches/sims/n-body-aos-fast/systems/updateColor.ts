import { defineSystem } from '@bitecs/classic';
import { bodyQuery } from '../queries/queries';
import { Velocity } from '../components/Velocity';
import { Color } from '../components/Color';
import { colorFromSpeed } from '../utils/colorFromSpeed';

export const updateColor = defineSystem((world) => {
	const eids = bodyQuery(world);

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
});
