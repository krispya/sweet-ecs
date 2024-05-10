import { Entity as EntityCore } from '@sweet-ecs/core';
import { useImperativeHandle, useLayoutEffect, useMemo } from 'react';
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
	const entity = useMemo(() => new EntityCore(world, true), [world]);
	useImperativeHandle(ref, () => entity);

	useLayoutEffect(() => {
		// Activate the entity when mounted.
		EntityCore.activate(entity);
		console.log('activating entity', entity.id);

		return () => {
			console.log('deactivating entity', entity.id);
			// When unmounted, destroy the entity and reset internal state.
			EntityCore.deactive(entity);
		};
	}, [world]);

	return <EntityContext.Provider value={entity}>{children}</EntityContext.Provider>;
}
