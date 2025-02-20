<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import Scopes from '../scopes.svelte';
    import { key } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Scopes</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose which permission scopes to grant your application. It is best practice to allow only
        the permissions you need to meet your project goals.
    </svelte:fragment>
    <Scopes bind:scopes={$key.scopes} />
</WizardStep>
