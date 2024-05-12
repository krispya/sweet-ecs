import { World as WorldCore } from '@sweet-ecs/core';

export type SweetNode = {
	$$typeof: Symbol;
	type: any;
	key: string | null;
	ref: React.Ref<any>;
	props: Record<string, any>;
	entityId: number;
	world: WorldCore;
};
