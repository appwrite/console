import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import { createArtifact } from '$lib/helpers/artifact';
import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
    const artifacts = await sdk.forProject(params.region, params.project).imagine.list();
    if (artifacts.total === 0) {
        await createArtifact(params.region, params.project);
        return;
    }

    const lastUpdatedArtifact = artifacts.artifacts.reduce((latest, artifact) => {
        return new Date(artifact.$updatedAt) > new Date(latest.$updatedAt) ? artifact : latest;
    });
    await redirect(
        303,
        `${base}/project-${params.region}-${params.project}/studio/artifact-${lastUpdatedArtifact.$id}`
    );
};
