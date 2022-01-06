import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

function createCollection() {
	const { subscribe, set, update } = writable<Models.Collection>();

	return {
		subscribe,
		set,
		addAttribute: (attribute: Models.Attributes) =>
			update((n) => {
				n.attributes.push(attribute);

				return n;
			}),
		updateAttribute: (attribute: Models.Attributes) =>
			update((n) => {
				const index = n.attributes.findIndex((a) => a.key === attribute.key);
				n.attributes[index] =attribute;

				return n;
			}),
		removeAttribute: (attribute: Models.Attributes) =>
			update((n) => {
				n.attributes = n.attributes.filter((a) => a.key !== attribute.key);

				return n;
			})
	};
}

export const collection = createCollection();
