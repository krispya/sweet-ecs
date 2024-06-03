import { World } from '@sweet-ecs/core';
import { scene } from '../scene';
import { camera, renderer } from '../main';

export const render = (_props: { world: World }) => {
	renderer.render(scene, camera);
};
