import React from 'react';
import { injectWorldIntoChildren } from './utils/inject-world-into-children';
import { wrapRef } from './utils/wrap-ref';
import { Entity } from '../entity/entity';
import { SweetNode } from './types/types';
import { World } from '../world/world';

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

	// Wrap the ref and merge it.
	if (typeof node.type === 'string') node.props = { ref: wrapRef(ref, node), ...node.props };

	// Handle `entity` intrinsic element.
	if (type === 'entity') node.type = Entity;

	// Handle `world` intrinsic element.
	if (type === 'world') node.type = createWrappedWorld(node);

	// If we are rendering `World`, start passing the world object down.
	if (type?.name === 'World') node.type = createWrappedWorld(node);

	// If it is a functional component, we wrap it and inject the world into its results.
	if (typeof type === 'function' && type?.name !== 'World') {
		node.type = (props: Record<string, any>) => {
			const result = type(props);

			if (typeof result === 'object' && result !== null) {
				// If we run into a processed context node, it has extensions prevented and we have to skip it.
				if (!result.hasOwnProperty('_store')) result.world = node.world;
				if (node.props.children) injectWorldIntoChildren(node, node.world);
			}

			return result;
		};
	}

	return node;
};

const createWrappedWorld = (node: SweetNode) => {
	return (props: Record<string, any>) => {
		const result = World(props);
		node.world = result.props.value;

		// Inject the world object into the children.
		if (node.props.children) injectWorldIntoChildren(node, node.world);

		return result;
	};
};
