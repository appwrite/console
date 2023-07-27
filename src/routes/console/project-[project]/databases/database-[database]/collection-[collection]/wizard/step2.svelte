<script lang="ts">
    import { Permissions } from '$lib/components/permissions';
    import { WizardStep } from '$lib/layout';
    import { createDocument } from './store';
    import { collection } from '../store';
    import { Alert } from '$lib/components';
    import LL from '$i18n/i18n-svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">{$LL.console.project.title.permissions()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.texts.databases.updatePermission.collectionAndDocumentation()}{' '}<a
            href="https://appwrite.io/docs/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            {$LL.console.project.texts.databases.updatePermission.permissionGuide()}
        </a>.
    </svelte:fragment>
    {#if $collection.documentSecurity}
        <div class="common-section">
            <Alert type="info">
                <svelte:fragment slot="title"
                    >{$LL.console.project.alert.databases.title.documentSecurity.enabled()}</svelte:fragment>
                {$LL.console.project.alert.databases.title.userPermission()}
                <b>{$LL.console.project.alert.databases.title.collectionPermission()}</b>.
            </Alert>
        </div>
        <div class="common-section">
            <Permissions bind:permissions={$createDocument.permissions} />
        </div>
    {:else}
        <Alert type="info">
            <svelte:fragment slot="title"
                >{$LL.console.project.alert.databases.title.documentSecurity.disabled()}</svelte:fragment>
            {$LL.console.project.alert.databases.title.permissionCheck()}
        </Alert>
    {/if}
</WizardStep>
