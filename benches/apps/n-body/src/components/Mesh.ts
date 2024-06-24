import { Component } from '@sweet-ecs/core';
import * as THREE from 'three';

export class Mesh extends Component {
	constructor(public object: THREE.Mesh) {
		super();
	}
}
