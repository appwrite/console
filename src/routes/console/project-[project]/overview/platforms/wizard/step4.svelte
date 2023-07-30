<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { WizardStep } from '$lib/layout';
</script>

<WizardStep>
    <svelte:fragment slot="title"
        >{$LL.console.project.texts.overview.readyTogo()} 🎉</svelte:fragment>
    <p>
        {$LL.console.project.texts.overview.congratulations()}
    </p>
</WizardStep>
