import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import { createArtifact } from '$lib/helpers/artifact';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';

export const load: PageLoad = async ({ params }) => {
    const artifacts = await sdk.forProject.imagine.list();
    if (artifacts.total === 0) {
        await createArtifact(params.project);
        return;
    }

    const lastUpdatedArtifact = artifacts.artifacts.reduce((latest, artifact) => {
        return new Date(artifact.$updatedAt) > new Date(latest.$updatedAt) ? artifact : latest;
    });
    await goto(`${base}/project-${params.project}/studio/artifact-${lastUpdatedArtifact.$id}`);
};
