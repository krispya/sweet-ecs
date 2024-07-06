import { InstancedMesh, Matrix3, Matrix4, Vector3 } from 'three';

export function bindMatrix4(instancedMesh: InstancedMesh, id: number, matrix: Matrix4) {
	const elements = instancedMesh.instanceMatrix.array.subarray(id * 16, id * 16 + 16);

	// Copy the matrix elements into the buffer subarray.
	for (let i = 0; i < 16; i++) {
		elements[i] = matrix.elements[i];
	}

	// Cast the buffer subarray as a number array.
	matrix.elements = elements as unknown as number[];

	// Wrap methods to update the instance matrix.
	matrix.set = function set(...args: Parameters<Matrix4['set']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.set.call(matrix, ...args);
	};

	matrix.identity = function identity(): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.identity.call(matrix);
	};

	matrix.multiply = function multiply(...args: Parameters<Matrix4['multiply']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.multiply.call(matrix, ...args);
	};

	matrix.premultiply = function premultiply(...args: Parameters<Matrix4['premultiply']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.premultiply.call(matrix, ...args);
	};

	matrix.scale = function scale(...args: Parameters<Matrix4['scale']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.scale.call(matrix, ...args);
	};

	matrix.compose = function compose(...args: Parameters<Matrix4['compose']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.compose.call(matrix, ...args);
	};

	matrix.invert = function invert(...args: Parameters<Matrix4['invert']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.invert.call(matrix, ...args);
	};

	matrix.lookAt = function lookAt(...args: Parameters<Matrix4['lookAt']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.lookAt.call(matrix, ...args);
	};

	matrix.makeRotationAxis = function makeRotationAxis(
		...args: Parameters<Matrix4['makeRotationAxis']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makeRotationAxis.call(matrix, ...args);
	};

	matrix.makeBasis = function makeBasis(...args: Parameters<Matrix4['makeBasis']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makeBasis.call(matrix, ...args);
	};

	matrix.makeOrthographic = function makeOrthographic(
		...args: Parameters<Matrix4['makeOrthographic']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makeOrthographic.call(matrix, ...args);
	};

	matrix.makePerspective = function makePerspective(
		...args: Parameters<Matrix4['makePerspective']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makePerspective.call(matrix, ...args);
	};

	matrix.makeRotationFromEuler = function makeRotationFromEuler(
		...args: Parameters<Matrix4['makeRotationFromEuler']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makeRotationFromEuler.call(matrix, ...args);
	};

	matrix.makeRotationFromQuaternion = function makeRotationFromQuaternion(
		...args: Parameters<Matrix4['makeRotationFromQuaternion']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return makeRotationFromQuaternion(...args);
	};

	matrix.makeRotationX = function makeRotationX(
		...args: Parameters<Matrix4['makeRotationX']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makeRotationX.call(matrix, ...args);
	};

	matrix.makeRotationY = function makeRotationY(
		...args: Parameters<Matrix4['makeRotationY']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makeRotationY.call(matrix, ...args);
	};

	matrix.makeRotationZ = function makeRotationZ(
		...args: Parameters<Matrix4['makeRotationZ']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makeRotationZ.call(matrix, ...args);
	};

	matrix.makeScale = function makeScale(...args: Parameters<Matrix4['makeScale']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makeScale.call(matrix, ...args);
	};

	matrix.makeShear = function makeShear(...args: Parameters<Matrix4['makeShear']>): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.makeShear.call(matrix, ...args);
	};

	function makeTranslation(x: number, y: number, z: number): Matrix4;
	function makeTranslation(v: Vector3): Matrix4;
	function makeTranslation(...args: [Vector3] | [number, number, number]): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		// @ts-expect-error - TS is having trouble with overloads and spread operators.
		return Matrix4.prototype.makeTranslation.call(matrix, ...args);
	}

	matrix.makeTranslation = makeTranslation;

	matrix.setFromMatrix3 = function setFromMatrix3(m: Matrix3): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.setFromMatrix3.call(matrix, m);
	};

	function setPosition(x: number, y: number, z: number): Matrix4;
	function setPosition(v: Vector3): Matrix4;
	function setPosition(...args: [Vector3] | [number, number, number]): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		// @ts-expect-error - TS is having trouble with overloads and spread operators.
		return Matrix4.prototype.setPosition.call(matrix, ...args);
	}

	matrix.setPosition = setPosition;

	matrix.transpose = function transpose(): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.transpose.call(matrix);
	};

	matrix.multiplyMatrices = function multiplyMatrices(
		...args: Parameters<Matrix4['multiplyMatrices']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.multiplyMatrices.call(matrix, ...args);
	};

	matrix.multiplyScalar = function multiplyScalar(
		...args: Parameters<Matrix4['multiplyScalar']>
	): Matrix4 {
		instancedMesh.instanceMatrix.needsUpdate = true;
		return Matrix4.prototype.multiplyScalar.call(matrix, ...args);
	};

	return matrix;
}

export function unbindMatrix4(matrix: Matrix4) {
	for (const key of Object.getOwnPropertyNames(matrix)) {
		if (key === 'elements') continue;
		delete matrix[key as keyof Matrix4];
	}

	const elements = Array.from(matrix.elements);
	matrix.elements = elements;

	return matrix;
}
