import { Mesh } from 'three';

export interface MeshRegistry {
	set: Set<Mesh>;
	array: Mesh[];
	isShared: boolean;
}
