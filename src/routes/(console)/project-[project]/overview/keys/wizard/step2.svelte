<script lang="ts">
    import { apiKey } from '../../store';
    import Scopes from '../scopes.svelte';
    import { WizardStep } from '$lib/layout';
    import { FormList } from '$lib/elements/forms';
</script>

<WizardStep>
    <svelte:fragment slot="title">Scopes</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose which permission scopes to grant your application. It is best practice to allow only
        the permissions you need to meet your project goals.
    </svelte:fragment>
    <FormList>
        <Scopes bind:scopes={$apiKey.scopes} />
    </FormList>
</WizardStep>
