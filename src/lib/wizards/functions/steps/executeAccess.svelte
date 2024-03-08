<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { Roles } from '$lib/components/permissions';
    import { createFunction } from '../store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Execution permissions</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can execute this function using the client API. For more information, visit our
        <a
            href="https://appwrite.io/docs/advanced/platform/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            Permissions guide
        </a>.
    </svelte:fragment>

    <Roles bind:roles={$createFunction.execute} />
</WizardStep>
