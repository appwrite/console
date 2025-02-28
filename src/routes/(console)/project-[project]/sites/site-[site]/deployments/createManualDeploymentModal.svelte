<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import InputFile from '$lib/elements/forms/inputFile.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { uploader } from '$lib/stores/uploader';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let site: Models.Site;

    let files: FileList;
    let error: string = '';

    async function createDeployment() {
        try {
            uploader.uploadSiteDeployment(site.$id, files[0]);
            show = false;
            invalidate(Dependencies.DEPLOYMENTS);
            addNotification({
                message: 'Deployment upload started',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
</script>

<Modal title="Create manual deployment" bind:show onSubmit={createDeployment} {error}>
    <span slot="description"> Manually deploy a site by uploading any file(s) or folder. </span>

    <InputFile
        label="Upload a zip file (tar.gz) containing your sites source code"
        allowedFileExtensions={['gz']}
        bind:files
        required />
    <svelte:fragment slot="footer">
        <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
        <Button size="s" disabled={!(files ?? [])[0]} submit submissionLoader>Create</Button>
    </svelte:fragment>
</Modal>
