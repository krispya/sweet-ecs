import { defineSystem } from '@bitecs/classic';
import { bodyQuery } from '../queries/queries';
import { Velocity } from '../components/Velocity';
import { Color } from '../components/Color';
import { colorFromSpeed } from '../utils/colorFromSpeed';

export const updateColor = defineSystem((world) => {
	const eids = bodyQuery(world);

	const velocities = Velocity.store;
	const colors = Color.store;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		const speed = Math.sqrt(velocities.x[eid] ** 2 + velocities.y[eid] ** 2);
		const { r, g, b, a } = colorFromSpeed(speed);

		colors.r[eid] = r;
		colors.g[eid] = g;
		colors.b[eid] = b;
		colors.a[eid] = a;
	}

	return world;
});
