<script lang="ts">
    import { FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import Scopes from '../scopes.svelte';
    import { key } from './store';
    import LL from '$i18n/i18n-svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">{$LL.console.project.title.addScopes()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.texts.overview.scopePermission()}
    </svelte:fragment>
    <FormList>
        <Scopes bind:scopes={$key.scopes} />
    </FormList>
</WizardStep>
