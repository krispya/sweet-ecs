import { Entity } from '@sweet-ecs/core';
import { SweetNode } from '../types/types';

export function wrapRef(ref: React.Ref<any>, node: SweetNode): React.RefCallback<any> {
	return (instance: any) => {
		if (node.world.isRegistered) {
			if (node.entityId === -1) node.entityId = Entity.in(node.world);
			console.log('jsx: registering right away', node.entityId, instance);
		} else {
			node.world.onRegister(() => {
				if (node.entityId === -1) node.entityId = Entity.in(node.world);
				console.log('jsx: registering on world registration', node.entityId, instance);
			});
		}

		let cleanup: any;

		if (ref) {
			if (typeof ref === 'function') {
				cleanup = ref(instance);
			} else {
				ref.current = instance;
			}
		}

		return () => {
			console.log('jsx: destroying', node.entityId);
			if (node.world.isRegistered) Entity.destroy(node.entityId);
			node.entityId = -1;
			if (cleanup) cleanup();
		};
	};
}
