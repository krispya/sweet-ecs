import React from 'react';
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
	};

	// Handle `entity` intrinsic element.
	if (type === 'entity') node.type = Entity;

	// Handle `world` intrinsic element.
	if (type === 'world') node.type = World;

	// Wrap JSX instrisics in an entity.
	if (typeof node.type === 'string') {
		const wrappedNode = {
			$$typeof: REACT_ELEMENT_TYPE,
			type: Entity,
			key,
			ref: undefined,
			props: { children: node },
		};

		return wrappedNode;
	}

	return node;
};
