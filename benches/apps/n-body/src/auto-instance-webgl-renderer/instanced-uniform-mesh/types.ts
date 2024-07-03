import { Vector2, Vector3, Vector4, Color, Matrix3, Matrix4, Quaternion } from 'three';

export type UniformValue =
	| number
	| Vector2
	| Vector3
	| Vector4
	| Color
	| any[]
	| Matrix3
	| Matrix4
	| Quaternion;
