import { Component } from '@sweet-ecs/core';
import * as THREE from 'three';

export class InstancedMesh extends Component {
	constructor(public object: THREE.InstancedMesh) {
		super();
	}
}
