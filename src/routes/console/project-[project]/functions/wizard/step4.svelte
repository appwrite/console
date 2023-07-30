<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { FormList, InputCron } from '$lib/elements/forms';
    import { createFunction } from './store';
    import LL from '$i18n/i18n-svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">{$LL.console.project.title.schedule()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.texts.functions.setCron()}
        <a
            href="https://appwrite.io/docs/functions#createFunction"
            target="_blank"
            rel="noopener noreferrer"
            class="link">{$LL.console.project.texts.functions.moreDetailsCronSyntax()}</a
        >.
    </svelte:fragment>
    <FormList>
        <InputCron
            bind:value={$createFunction.schedule}
            label="Schedule (Cron Syntax)"
            id="schedule" />
    </FormList>
</WizardStep>
