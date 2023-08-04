import { Dependencies } from '$lib/constants.js';
import { sdk } from '$lib/stores/sdk';

async function getFirebaseProjects() {
    try {
        const res = await sdk.forProject.migrations.listFirebaseProjects();
        return res.projects;
    } catch (e) {
        if (e.code === 401) {
            return [];
        } else {
            throw e;
        }
    }
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
