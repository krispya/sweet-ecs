import { World as WorldCore } from '@sweet-ecs/core';
import { SweetNode } from '../types/types';

export function injectWorldIntoChildren(node: SweetNode, world: WorldCore): SweetNode {
	if (typeof node !== 'object') return node;

	node.world = world;

	if (node.props && node.props.children) {
		if (Array.isArray(node.props.children)) {
			node.props.children = node.props.children.map((child) =>
				injectWorldIntoChildren(child, world)
			);
		} else {
			node.props.children = injectWorldIntoChildren(node.props.children, world);
		}
	}

	return node;
}
