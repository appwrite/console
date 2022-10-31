<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { createFunction } from './store';
    import { Roles } from '$lib/components/permissions';
</script>

<WizardStep>
    <svelte:fragment slot="title">Execute access</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can execute this function using the client API. Check out our documentation for
        more on <a href="#/" target="_blank" rel="noopener noreferrer" class="link">
            Permissions</a
        >.
    </svelte:fragment>

    <Roles bind:roles={$createFunction.execute} />
</WizardStep>
