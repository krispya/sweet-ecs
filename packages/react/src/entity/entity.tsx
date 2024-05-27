import { Component as ComponentCore, Entity as EntityCore } from '@sweet-ecs/core';
import React, { useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useWorld } from '../world/use-world';

type ComponentsProp<T extends typeof ComponentCore> = (
	| T
	| InstanceType<T>
	| null
	| undefined
	| false
)[];

type Props<T extends typeof ComponentCore> = {
	children?: React.ReactNode;
	ref?: React.RefObject<EntityCore>;
	components?: ComponentsProp<T>;
	entityId?: number;
};

// We create an entity object speculatively but don't commit it until the component is mounted.
// This mirrors React's expectations with DOM elements.

export function Entity<T extends typeof ComponentCore>({
	children,
	ref,
	components,
	entityId,
}: Props<T>) {
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
		if (!components) return;
		let unsub: () => void;

		if (entity.isRegistered) {
			addComponentProps(entity, components);
		} else {
			unsub = entity.onRegister(() => {
				addComponentProps(entity, components);
			});
		}

		return () => {
			unsub?.();
		};
	}, [components, entity]);

	return children;
}

function addComponentProps<T extends typeof ComponentCore>(
	entity: EntityCore,
	components: ComponentsProp<T>
) {
	for (const component of components) {
		if (!component) continue;
		entity.add(component);
	}
}
