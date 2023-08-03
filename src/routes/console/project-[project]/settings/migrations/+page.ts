import { Dependencies } from '$lib/constants.js';
import { sdk } from '$lib/stores/sdk';

async function getFirebaseProjects() {
    const res = await sdk.forProject.migrations.listFirebaseProjects();
    return res.projects;
}

export async function load({ depends }) {
    depends(Dependencies.MIGRATIONS);

    try {
        const { migrations } = await sdk.forProject.migrations.list();

        console.log('migrations', migrations);
        return {
            migrations,
            firebaseProjects: getFirebaseProjects()
        };
    } catch {
        return {
            migrations: []
        };
    }
}
