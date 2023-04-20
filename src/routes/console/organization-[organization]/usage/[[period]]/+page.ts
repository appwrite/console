import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    try {
        return {
            projectUsage: [
                {
                    title: 'Total',
                    usage: {
                        name: 'badwidth',
                        max: 100,
                        used: 50,
                        unit: 'GB'
                    }
                }
            ]
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
