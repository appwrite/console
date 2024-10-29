import { Dependencies } from '$lib/constants.js';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';

export async function load({ depends }) {
    depends(Dependencies.MIGRATIONS);

    try {
        const { migrations } = await sdk.forProject.migrations.list([
            // hides backups/restorations from migrations page.
            Query.equal('source', ['Appwrite', 'Firebase', 'NHost', 'Supabase']),
            Query.or([
                Query.equal('destination', ['Appwrite', 'Firebase', 'NHost', 'Supabase']),
                Query.isNull('destination')
            ])
        ]);

        return {
            migrations
        };
    } catch {
        return {
            migrations: []
        };
    }
}
