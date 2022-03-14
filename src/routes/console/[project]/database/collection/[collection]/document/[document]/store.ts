import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from 'src/sdk';
import { writable } from 'svelte/store';

function createDocumentStore() {
	const { subscribe, set } = writable<Models.Document>();

	return {
		subscribe,
		set,
		load: async (collectionId: string, documentId: string) => {
			set(await sdkForProject.database.getDocument(collectionId, documentId));
		}
	};
}

export const document = createDocumentStore();
