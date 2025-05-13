import { sdk } from '$lib/stores/sdk';
import { ID } from '@appwrite.io/console';
import { goto, invalidate } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Dependencies } from '$lib/constants';

export async function createArtifact() {
    const artifact = await sdk.forProject.imagine.create(ID.unique());

    await goto(`${base}/project-${page.params.project}/studio/artifact-${artifact.$id}`);
    invalidate(Dependencies.ARTIFACTS);
}
