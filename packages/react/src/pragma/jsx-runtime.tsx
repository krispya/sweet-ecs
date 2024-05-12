import React from 'react';
import { World } from '../world/world';
import { injectWorldIntoChildren } from './utils/inject-world-into-children';
import { wrapRef } from './utils/wrap-ref';
import { Entity } from '../entity/entity';
import { SweetNode } from './types/types';

const REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element');

// This is just a human readable conversion of the production React `jsx` function.

export const jsx = (type: any, props: Record<string, any>, maybeKey?: React.Key) => {
	// Get the key.
	let key = null;
	if (maybeKey !== undefined) key = String(maybeKey);
	if (props.key !== undefined) key = String(props.key);

	// Remove the key from the props.
	let finalProps = props;
	if ('key' in props) {
		finalProps = {};
		for (const propName in props) {
			if (propName !== 'key') {
				finalProps[propName] = props[propName];
			}
		}
	}

	// Extract the ref from the props.
	const ref = finalProps.ref !== undefined ? finalProps.ref : null;

	const node: SweetNode = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props: finalProps,
		entityId: -1,
		world: undefined!,
	};

	// // If we are rendering `World`, start passing the world object down.
	if (type === World) {
		node.world = node.props.value;
		// // Inject the world object into the children.
		if (node.props.children) injectWorldIntoChildren(node, node.world);
	}

	if (type === 'entity') {
		console.log('entity!');
		node.type = Entity;
	}

	// Wrap the ref and merge it.
	node.props = { ref: wrapRef(ref, node), ...node.props };

	console.log(node);

	return node;
};
