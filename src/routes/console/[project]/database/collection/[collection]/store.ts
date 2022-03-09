import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

type Attributes =
	| Models.AttributeBoolean
	| Models.AttributeEmail
	| Models.AttributeEnum
	| Models.AttributeFloat
	| Models.AttributeInteger
	| Models.AttributeIp
	| Models.AttributeString
	| Models.AttributeUrl;

function createCollection() {
	const { subscribe, set, update } = writable<Models.Collection>();

	return {
		subscribe,
		set,
		addAttribute: (attribute: Attributes) =>
			update((n) => {
				n.attributes.push(attribute);

				return n;
			}),
		updateAttribute: (attribute: Attributes) =>
			update((n) => {
				const index = n.attributes.findIndex((a) => a.key === attribute.key);
				n.attributes[index] = attribute;

				return n;
			}),
		removeAttribute: (attribute: Attributes) =>
			update((n) => {
				n.attributes = n.attributes.filter((a) => a.key !== attribute.key);

				return n;
			})
	};
}

export const collection = createCollection();
