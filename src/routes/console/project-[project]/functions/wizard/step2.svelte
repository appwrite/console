<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { createFunction } from './store';
    import { Roles } from '$lib/components/permissions';
    import LL from '$i18n/i18n-svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">{$LL.console.project.title.executeAccess()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.texts.functions.setPermission()}
        <a
            href="https://appwrite.io/docs/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            {$LL.console.project.texts.functions.permissionGuide()}
        </a>.
    </svelte:fragment>

    <Roles bind:roles={$createFunction.execute} />
</WizardStep>
