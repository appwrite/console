<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { createFunction } from './store';
    import { Roles } from '$lib/components/permissions';
</script>

<WizardStep>
    <svelte:fragment slot="title">Execute access</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can execute this function using the client API. For more information, check out
        the <a
            href="https://appwrite.io/docs/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            Permissions guide
        </a>.
    </svelte:fragment>

    <Roles bind:roles={$createFunction.execute} />
</WizardStep>
