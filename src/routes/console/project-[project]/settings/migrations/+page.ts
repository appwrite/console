import { Dependencies } from '$lib/constants.js';
import { sdk } from '$lib/stores/sdk';

export async function load({ depends }) {
    depends(Dependencies.MIGRATIONS);

    const { imports } = await sdk.forProject.imports.list();

    return {
        imports
    };
}
