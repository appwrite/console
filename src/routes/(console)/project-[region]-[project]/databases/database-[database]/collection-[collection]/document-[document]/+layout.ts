import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { error } from '@sveltejs/kit';
import type { Attributes } from '../store';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    depends(Dependencies.DOCUMENT);
    const { collection } = await parent();

    try {
        const document = await sdk
            .forProject(params.region, params.project)
            .databases.getDocument(params.database, params.collection, params.document);

        /**
         * Sanitize DateTime to remove UTC Timezone section.
         */
        collection.attributes.forEach((attribute) => {
            const { type, key, array } = attribute as unknown as Attributes;
            if (type === 'datetime') {
                if (array) {
                    document[key] = document[key].map((n: string) => {
                        if (!n) {
                            return null;
                        }
                        return new Date(n).toISOString().slice(0, 23);
                    });
                } else {
                    if (document[key]) {
                        document[key] = new Date(document[key]).toISOString().slice(0, 23);
                    } else {
                        document[key] = null;
                    }
                }
            }
        });

        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            document
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
