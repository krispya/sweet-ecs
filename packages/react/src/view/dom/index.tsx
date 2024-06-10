import { domComponents } from './components/components';
import { SweetElement } from './sweet-element';

type SweetElemnets = 'div' extends keyof React.JSX.IntrinsicElements
	? {
			[K in keyof typeof domComponents]: (
				props: Omit<React.ComponentProps<typeof SweetElement<K>>, 'type'>
			) => JSX.Element;
	  }
	: Record<string, never>;

let hasReactDom = false;

try {
	await import('react-dom').then(() => {
		hasReactDom = true;
	});
} catch {}

export const sweet = {} as SweetElemnets;

if (hasReactDom) {
	for (const key in domComponents) {
		sweet[key as keyof typeof domComponents] = (props: any) => (
			<SweetElement type={key as keyof typeof domComponents} {...props} />
		);
	}
}
