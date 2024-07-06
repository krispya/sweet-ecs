import { initStats } from '@app/bench-tools';
import { CONSTANTS, schedule, world } from '@sim/n-body';
import * as THREE from 'three';
import './styles.css';
import { syncThreeObjects } from './systems/syncThreeObjects';
import { render } from './systems/render';
import { init } from './systems/init';
import { TurboWebGLRenderer } from './turbo-webgl-renderer/turbo-webgl-renderer';

// Configure the simulation
// CONSTANTS.NBODIES = 2000;

// Renderer
export const renderer = new TurboWebGLRenderer({
	antialias: true,
	powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera
const frustumSize = 8000;
const aspect = window.innerWidth / window.innerHeight;
export const camera = new THREE.OrthographicCamera(
	(-frustumSize * aspect) / 2,
	(frustumSize * aspect) / 2,
	frustumSize / 2,
	-frustumSize / 2,
	0.1,
	500
);

function onWindowResize() {
	const aspect = window.innerWidth / window.innerHeight;

	camera.left = (-frustumSize * aspect) / 2;
	camera.right = (frustumSize * aspect) / 2;
	camera.top = frustumSize / 2;
	camera.bottom = -frustumSize / 2;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// Camera position
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

// Add view systems to the schedule
schedule.add(syncThreeObjects, { after: 'update', before: render });
schedule.add(render, { after: 'update' });
schedule.add(init, { tag: 'init' });
schedule.build();

// Init stats
const { updateStats, measure, create } = initStats({ Bodies: () => CONSTANTS.NBODIES });
create();

// Run the simulation
const main = async () => {
	await measure(async () => {
		await schedule.run({ world });
		updateStats();
	});
	requestAnimationFrame(main);
};

requestAnimationFrame(main);
