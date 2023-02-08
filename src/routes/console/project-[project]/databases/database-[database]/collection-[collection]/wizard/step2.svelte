<script lang="ts">
    import { Permissions } from '$lib/components/permissions';
    import { WizardStep } from '$lib/layout';
    import { createDocument } from './store';
    import { collection } from '../store';
    import { Alert } from '$lib/components';
</script>

<WizardStep>
    <svelte:fragment slot="title">Permissions</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can access your collection and documents. For more information, check out the <a
            href="https://appwrite.io/docs/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            Permissions Guide
        </a>.
    </svelte:fragment>
    {#if $collection.documentSecurity}
        <div class="common-section">
            <Alert type="info">
                <svelte:fragment slot="title">Document security is enabled</svelte:fragment>
                Users will be able to access this document if they have been granted
                <b>either Document or Collection permissions</b>.
            </Alert>
        </div>
        <div class="common-section">
            <Permissions bind:permissions={$createDocument.permissions} />
        </div>
    {:else}
        <Alert type="info">
            <svelte:fragment slot="title">Document security is disabled</svelte:fragment>
            If you want to assign document permissions, navigate to Collection settings and enable document
            security. Otherwise, only Collection permissions will be used.
        </Alert>
    {/if}
</WizardStep>
