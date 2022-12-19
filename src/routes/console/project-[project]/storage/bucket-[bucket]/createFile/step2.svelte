<script lang="ts">
    import Alert from '$lib/components/alert.svelte';
    import Permissions from '$lib/components/permissions/permissions.svelte';
    import FormList from '$lib/elements/forms/formList.svelte';
    import WizardStep from '$lib/layout/wizardStep.svelte';
    import { bucket } from '../store';
    import { store } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Set permissions</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can access your buckets and files. For more information, check out the
        <a
            href="https://appwrite.io/docs/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">Permissions Guide</a> in our documentation.
    </svelte:fragment>
    <FormList>
        {#if $bucket.fileSecurity}
            <div class="common-section">
                <Alert type="info">
                    <svelte:fragment slot="title">File security enabled</svelte:fragment>
                    Users will be able to access this file if they have been granted
                    <b>either File or Bucket permissions</b>.
                </Alert>
            </div>
            <div class="common-section">
                <Permissions bind:permissions={$store.permissions} />
            </div>
        {:else}
            <Alert type="info">
                <svelte:fragment slot="title">File security disabled</svelte:fragment>
                If you want to assign file permissions, navigate to Bucket settings and enable file security.
                Otherwise, only Bucket permissions will be used.
            </Alert>
        {/if}
    </FormList>
</WizardStep>
