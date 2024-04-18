// Based on Sander Mertens' ECS N-Body simulation for Flecs
// https://github.com/SanderMertens/ecs_nbody

import { measure, requestAnimationFrame } from '@sim/bench-tools';
import { init } from './systems/init';
import { pipeline } from './systems/pipeline';
import { world } from '@sim/n-body-aos';

// Start the simulation.
const main = () => {
	measure(() => pipeline(world));
	requestAnimationFrame(main);
};

// Initialize all entities.
init(world);

requestAnimationFrame(main);
