import { Dependencies } from '$lib/constants.js';
import { sdk } from '$lib/stores/sdk';
import { get } from 'svelte/store';
import { started } from './stores.js';

export async function load({ depends }) {
    depends(Dependencies.MIGRATIONS);

    const { migrations } = await sdk.forProject.migrations.list();

    console.log(migrations, (performance.now() - get(started)) / 1000);

    return {
        migrations
    };
}
