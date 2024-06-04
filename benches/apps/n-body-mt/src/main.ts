import { initStats } from '@app/bench-tools';
import { CONSTANTS, schedule, world } from '@sim/n-body-mt';
import * as THREE from 'three';
import './styles.css';
import { init } from './systems/init';
import { syncThreeObjects } from './systems/syncThreeObjects';
import { render } from './systems/render';

// Renderer
export const renderer = new THREE.WebGLRenderer({
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

const { updateStats, measure } = initStats({
	Bodies: () => CONSTANTS.NBODIES,
	Threads: () => window.navigator.hardwareConcurrency,
});

// Add view systems to the schedule
schedule.add(syncThreeObjects, { after: 'update', before: render });
schedule.add(render);
schedule.add(init, { tag: 'init' });

// Run the simulation
const main = async () => {
	await measure(async () => {
		await schedule.run({ world });
		updateStats();
	});
	requestAnimationFrame(main);
};

main();
