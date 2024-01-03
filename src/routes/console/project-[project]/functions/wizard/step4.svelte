<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { FormList, InputCron } from '$lib/elements/forms';
    import { createFunction } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Schedule</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set a Cron schedule to trigger your function. Leave blank for no schedule. <a
            href="https://appwrite.io/docs/products/functions/execution#schedule"
            target="_blank"
            rel="noopener noreferrer"
            class="link">More details on Cron syntax here</a
        >.
    </svelte:fragment>
    <FormList>
        <InputCron
            bind:value={$createFunction.schedule}
            label="Schedule (Cron Syntax)"
            id="schedule" />
    </FormList>
</WizardStep>
