import { Component, Store } from '@sweet-ecs/core';

export type InitData = {
	stores: {
		read: Record<string, Store>;
		write: Record<string, Store>;
	};
	queryBuffers: Record<string, SharedArrayBuffer>;
	worldId: number;
};

export type ComponentMap = Map<string, typeof Component>;
export type ComponentToKeyMap = Map<typeof Component, string>;
