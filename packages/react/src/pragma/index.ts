import { jsx } from './jsx-runtime';
import '../component/patch-core';

export { Fragment } from 'react';
export { jsx };
export const jsxs = jsx;
export const jsxDEV = jsx;

export { type SweetJSX as JSX } from './types/jsx-namespace';
