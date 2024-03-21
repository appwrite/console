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
        Choose who can access your collection and documents. For more information, visit our <a
            href="https://appwrite.io/docs/products/databases/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            Permissions guide
        </a>.
    </svelte:fragment>
    {#if $collection.documentSecurity}
        <div class="common-section">
            <Alert type="info">
                <svelte:fragment slot="title">Document level permissions are enabled</svelte:fragment>
                Users will be able to access this document if they have been granted 
                <b>either document or collection level permissions.</b>
            </Alert>
        </div>
        <div class="common-section">
            <Permissions bind:permissions={$createDocument.permissions} />
        </div>
    {:else}
        <Alert type="info">
            <svelte:fragment slot="title">Document level permissions are disabled</svelte:fragment>
                If you want to assign different permissions to individual documents. Go to 
                you collection's settings and enable document level permissions. Otherwise, 
                all documents in the collection share the same collection level permissions.
        </Alert>
    {/if}
</WizardStep>
