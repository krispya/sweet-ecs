import { BufferGeometry } from 'three';

export class DerivedBufferGeometry extends BufferGeometry {
	baseGeometry: BufferGeometry;

	constructor(baseGeometry: BufferGeometry) {
		super();
		this.baseGeometry = baseGeometry;

		// Copy the base geometry into the derived geometry.
		Object.assign(this, baseGeometry);

		// Copy the attributes into the derived geometry.
		this.attributes = Object.create(baseGeometry.attributes);

		// Dispose the derived geometry when the base geometry is disposed.
		baseGeometry.addEventListener('dispose', () => {
			this.dispose();
		});
	}

	dispose() {
		this.baseGeometry.dispose();
		this.dispose();
	}
}
