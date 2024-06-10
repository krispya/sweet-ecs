import { SweetElement } from './sweet-element';
import { threeComponents } from './components/components';

type SweetElemnets = 'object3D' extends keyof React.JSX.IntrinsicElements
	? {
			[K in keyof typeof threeComponents]: (
				props: Omit<React.ComponentProps<typeof SweetElement<K>>, 'type'>
			) => JSX.Element;
	  }
	: Record<string, never>;

let hasR3F = false;

try {
	await import('@react-three/fiber').then(() => {
		hasR3F = true;
	});
} catch {}

export const sweet = {} as SweetElemnets;

if (hasR3F) {
	for (const key in threeComponents) {
		(sweet as any)[key as keyof typeof threeComponents] = (props: any) => (
			<SweetElement type={key as keyof typeof threeComponents} {...props} />
		);
	}
}
