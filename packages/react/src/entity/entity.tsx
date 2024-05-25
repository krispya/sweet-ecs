import { Entity as EntityCore } from '@sweet-ecs/core';
import React, { useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useWorld } from '../world/use-world';
import { EntityContext } from './entity-context';

type Props = {
	children?: React.ReactNode;
	ref?: React.RefObject<EntityCore>;
};

// We create an entity object speculatively but don't commit it until the component is mounted.
// This mirrors React's expectations with DOM elements.

export function Entity({ children, ref }: Props) {
	const world = useWorld();
	const entity = useMemo(() => EntityCore.define(world), [world]);
	useImperativeHandle(ref, () => entity);

	useLayoutEffect(() => {
		let unsub: () => void;

		// Activate the entity when mounted.
		if (world.isRegistered) {
			if (!entity.isRegistered) entity.register();
		} else {
			unsub = world.onRegister(() => {
				if (!entity.isRegistered) entity.register();
			});
		}

		return () => {
			// When unmounted, destroy the entity and reset internal state.
			unsub?.();
			if (entity.isRegistered) entity.destroy();
		};
	}, [world]);

	// Merge entity prop into children props.
	// const childrenWithEntity = React.Children.map(children, (child) => {
	// 	console.log('child', child);
	// 	if (React.isValidElement(child)) {
	// 		return React.cloneElement<any>(child, { entity });
	// 	}
	// 	return child;
	// });

	return <EntityContext.Provider value={entity}>{children}</EntityContext.Provider>;
}
