import './component/patch-core';

import { World } from './world/world';
import { useWorld } from './world/use-world';
import { WorldContext } from './world/world-context';
import { Entity } from './entity/entity';
import { Component } from './component/component';

const Sweet = {
	World,
	WorldContext,
	useWorld,
	Entity,
	Component,
};

export default Sweet;

export { World } from './world/world';
export { useWorld } from './world/use-world';
export { WorldContext } from './world/world-context';
export { Entity } from './entity/entity';
export { Component } from './component/component';
