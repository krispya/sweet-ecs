import { Component as ComponentCore, Entity as EntityCore } from '@sweet-ecs/core';
import React, { useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useWorld } from '../world/use-world';
import { EntityContext } from './entity-context';

type Props = {
	children?: React.ReactNode;
	ref?: React.RefObject<EntityCore>;
	components?: (typeof ComponentCore)[];
	entityId?: number;
};

// We create an entity object speculatively but don't commit it until the component is mounted.
// This mirrors React's expectations with DOM elements.

export function Entity({ children, ref, components, entityId }: Props) {
	const world = useWorld();
	const entity = useMemo(() => EntityCore.define(world, entityId), [world]);
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

	useLayoutEffect(() => {
		if (!components || !entity.isRegistered) return;
		components.forEach((component) => entity.add(component));

		return () => {
			components.forEach((component) => entity.remove(component));
		};
	}, [components]);

	return <EntityContext.Provider value={entity}>{children}</EntityContext.Provider>;
}
