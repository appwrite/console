import { Dependencies } from '$lib/constants.js';
import { sdk } from '$lib/stores/sdk';

export async function load({ depends }) {
    depends(Dependencies.MIGRATIONS);

    try {
        const { migrations } = await sdk.forProject.migrations.list();

        return {
            migrations
        };
    } catch {
        return {
            migrations: []
        };
    }
}
