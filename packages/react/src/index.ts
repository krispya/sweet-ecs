import { World } from './world/world';
import { useWorld } from './world/use-world';
import { WorldContext } from './world/world-context';
import { Entity } from './entity/entity';
import { Component } from './component/component';
import { useEntity } from './entity/use-entity';

const Sweet = {
	World,
	WorldContext,
	useWorld,
	Entity,
	Component,
	useEntity,
};

export default Sweet;

export { World } from './world/world';
export { useWorld } from './world/use-world';
export { WorldContext } from './world/world-context';
export { Entity } from './entity/entity';
export { Component } from './component/component';

// Views
import { sweet as sweetThree } from './view/three/index';
import { sweet as sweetDom } from './view/dom/index';

export const sweet = { ...sweetThree, ...sweetDom };
export * from './view/three/components/index';
export * from './view/dom/components/index';
