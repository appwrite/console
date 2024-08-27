<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { createFunction } from './store';
    import { Roles } from '$lib/components/permissions';
</script>

<WizardStep>
    <svelte:fragment slot="title">Permissions</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose which users have permission to execute this function using Client SDKs. For more
        information, visit our <a
            href="https://appwrite.io/docs/advanced/platform/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            permissions documentation
        </a>.
    </svelte:fragment>

    <Roles bind:roles={$createFunction.execute} />
</WizardStep>
