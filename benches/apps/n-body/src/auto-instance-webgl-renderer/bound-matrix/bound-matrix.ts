import { InstancedMesh, Matrix3, Matrix4, Vector3 } from 'three';

export class BoundMatrix4 extends Matrix4 {
	instancedMesh: InstancedMesh;

	constructor(instancedMesh: InstancedMesh, id: number) {
		super();
		this.instancedMesh = instancedMesh;

		const elements = instancedMesh.instanceMatrix.array.subarray(id * 16, id * 16 + 16);

		// Cast the buffer subarray as a number array.
		this.elements = elements as unknown as number[];
	}

	set(...args: Parameters<Matrix4['set']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.set(...args);
	}

	identity(): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.identity();
	}

	multiply(...args: Parameters<Matrix4['multiply']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.multiply(...args);
	}

	premultiply(...args: Parameters<Matrix4['premultiply']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.premultiply(...args);
	}

	scale(...args: Parameters<Matrix4['scale']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.scale(...args);
	}

	compose(...args: Parameters<Matrix4['compose']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.compose(...args);
	}

	invert(...args: Parameters<Matrix4['invert']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.invert(...args);
	}

	lookAt(...args: Parameters<Matrix4['lookAt']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.lookAt(...args);
	}

	makeRotationAxis(...args: Parameters<Matrix4['makeRotationAxis']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeRotationAxis(...args);
	}

	makeBasis(...args: Parameters<Matrix4['makeBasis']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeBasis(...args);
	}

	makeOrthographic(...args: Parameters<Matrix4['makeOrthographic']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeOrthographic(...args);
	}

	makePerspective(...args: Parameters<Matrix4['makePerspective']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makePerspective(...args);
	}

	makeRotationFromEuler(...args: Parameters<Matrix4['makeRotationFromEuler']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeRotationFromEuler(...args);
	}

	makeRotationFromQuaternion(...args: Parameters<Matrix4['makeRotationFromQuaternion']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeRotationFromQuaternion(...args);
	}

	makeRotationX(...args: Parameters<Matrix4['makeRotationX']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeRotationX(...args);
	}

	makeRotationY(...args: Parameters<Matrix4['makeRotationY']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeRotationY(...args);
	}

	makeRotationZ(...args: Parameters<Matrix4['makeRotationZ']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeRotationZ(...args);
	}

	makeScale(...args: Parameters<Matrix4['makeScale']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeScale(...args);
	}

	makeShear(...args: Parameters<Matrix4['makeShear']>): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.makeShear(...args);
	}

	makeTranslation(x: number, y: number, z: number): this;
	makeTranslation(v: Vector3): this;
	makeTranslation(x: Vector3 | number, y?: number, z?: number): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		if (x instanceof Vector3) {
			return super.makeTranslation(x);
		} else {
			return super.makeTranslation(x, y!, z!);
		}
	}

	setFromMatrix3(m: Matrix3): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.setFromMatrix3(m);
	}

	setPosition(x: number, y: number, z: number): this;
	setPosition(v: Vector3): this;
	setPosition(x: Vector3 | number, y?: number, z?: number): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		if (x instanceof Vector3) {
			return super.setPosition(x);
		} else {
			return super.setPosition(x, y!, z!);
		}
	}

	transpose(): this {
		this.instancedMesh.instanceMatrix.needsUpdate = true;
		return super.transpose();
	}
}
