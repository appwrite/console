<script lang="ts">
    import Alert from '$lib/components/alert.svelte';
    import Permissions from '$lib/components/permissions/permissions.svelte';
    import WizardStep from '$lib/layout/wizardStep.svelte';
    import { bucket } from '../store';
    import { createFile } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Permissions</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can access your buckets and files. For more information, check out the
        <a
            href="https://appwrite.io/docs/advanced/platform/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            Permissions Guide
        </a>.</svelte:fragment>

    {#if $bucket.fileSecurity}
        <div class="common-section">
            <Alert type="info">
                <svelte:fragment slot="title">File level permissions enabled</svelte:fragment>
                Users will be able to access this file if they have been granted 
                <b>either file or bucket level permissions.</b>
            </Alert>
        </div>
        <div class="common-section">
            <Permissions bind:permissions={$createFile.permissions} />
        </div>
    {:else}
        <Alert type="info">
            <svelte:fragment slot="title">File level permissions disabled</svelte:fragment>
            If you want to assign different permissions to individual files. Go to 
            you bucket's settings and enable file level permissions. Otherwise, 
            all file in the bucket share the same bucket level permissions.
        </Alert>
    {/if}
</WizardStep>
