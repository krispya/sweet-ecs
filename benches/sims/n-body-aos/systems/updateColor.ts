import { Velocity } from '../components/Velocity';
import { Color } from '../components/Color';
import { colorFromSpeed } from '../utils/colorFromSpeed';
import { World } from '@sweet-ecs/core';

export const updateColor = ({ world }: { world: World }) => {
	const eids = world.query([Velocity, Color]);

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		const velocity = Velocity.get(eid);
		const color = Color.get(eid);

		const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
		const { r, g, b, a } = colorFromSpeed(speed);

		color.r = r;
		color.g = g;
		color.b = b;
		color.a = a;
	}

	return world;
};
