import { Component } from '@sweet-ecs/core';
import * as THREE from 'three';

export class ThreeInstances extends Component.createSoA<{ value: THREE.InstancedMesh }>() {
	constructor(public value: THREE.InstancedMesh) {
		super();
		this.value = value;
	}
}
