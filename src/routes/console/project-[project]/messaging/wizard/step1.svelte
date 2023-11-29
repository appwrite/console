<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { messageParams, providerType } from './store';
    import { providers } from '../providers/store';
    import EmailFormList from './emailFormList.svelte';

    async function beforeSubmit() {
        console.log($messageParams[$providerType]);
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Message</svelte:fragment>
    <svelte:fragment slot="subtitle">
        <!-- TODO: update documentation link -->
        Create an {providers[$providerType].text} that will be displayed to your subscribers. Learn more
        in our documentation.
    </svelte:fragment>
    <EmailFormList />
</WizardStep>
