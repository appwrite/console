<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { FormList, InputCron } from '$lib/elements/forms';
    import { createFunction } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Scheduling</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set a CRON schedule to trigger your function. Leave blank for no schedule. <a
            href="https://appwrite.io/docs/functions#createFunction"
            target="_blank"
            rel="noopener noreferrer"
            class="link">More details on CRON syntax here</a
        >.
    </svelte:fragment>
    <FormList>
        <InputCron
            bind:value={$createFunction.schedule}
            label="Schedule (CRON Syntax)"
            id="schedule" />
    </FormList>
</WizardStep>
