import {LitElement} from 'lit-element';

export const promisifyFlush = (flush: Function) => () => new Promise(resolve => flush(resolve));

const onEvent: (eventName: string) => (element: LitElement) => Promise<any> =
  (eventName: string) => (element: LitElement) => new Promise(resolve => {
    element.addEventListener(eventName, (event: Event) => resolve(event));
  });

export const onExmgTokenInputSelected: (element: LitElement) => Promise<any> = onEvent('exmg-token-input-select');

export const onExmgTokenInputDeselected: (element: LitElement) => Promise<any> = onEvent('exmg-token-input-deselect');
