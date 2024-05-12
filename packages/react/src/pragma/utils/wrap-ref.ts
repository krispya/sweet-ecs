import { Entity } from '@sweet-ecs/core';
import { SweetNode } from '../types/types';

export function wrapRef(ref: React.Ref<any>, node: SweetNode): React.RefCallback<any> {
	return (instance: any) => {
		if (node.entityId === -1) node.entityId = Entity.in(node.world);

		let cleanup: any;

		if (ref) {
			if (typeof ref === 'function') {
				cleanup = ref(instance);
			} else {
				ref.current = instance;
			}
		}

		return () => {
			Entity.destory(node.entityId);
			if (cleanup) cleanup();
		};
	};
}
