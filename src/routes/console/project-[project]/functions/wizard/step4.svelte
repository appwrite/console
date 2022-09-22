<script lang="ts">
    import { WizardStep } from '$lib/layout';
    // import { createFunction } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Scheduling (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set a CRON schedule to trigger your function. Leave blank for no schedule. <a
            href="#/"
            target="_blank"
            rel="noopener noreferrer"
            class="link">More details on CRON syntax here</a
        >.
    </svelte:fragment>

    EVENT
</WizardStep>
