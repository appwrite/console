import { sdk } from '$lib/stores/sdk';
import { ID } from '@appwrite.io/console';
import { goto, invalidate } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Dependencies } from '$lib/constants';

export async function createArtifact(region: string, projectId?: string) {
    const artifact = await sdk.forProject(region, projectId).imagine.create(ID.unique());
    await goto(
        `${base}/project-${region}-${projectId ?? page.params.project}/studio/artifact-${artifact.$id}`
    );
    invalidate(Dependencies.ARTIFACTS);
}
