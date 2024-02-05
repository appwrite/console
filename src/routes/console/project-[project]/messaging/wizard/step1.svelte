<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { messageParams, providerType } from './store';
    import { providers } from '../providers/store';
    import EmailFormList from './emailFormList.svelte';
    import SmsFormList from './smsFormList.svelte';
    import PushFormList, { validateData } from './pushFormList.svelte';
    import { MessagingProviderType } from '@appwrite.io/console';

    async function beforeSubmit() {}
</script>

<WizardStep
    {beforeSubmit}
    nextDisabled={$providerType === MessagingProviderType.Push &&
        !!validateData($messageParams[MessagingProviderType.Push].data)}>
    <svelte:fragment slot="title">Message</svelte:fragment>
    <svelte:fragment slot="subtitle">
        <!-- TODO: update documentation link -->
        Create an {providers[$providerType].text} that will be displayed to your subscribers. Learn more
        in our documentation.
    </svelte:fragment>
    {#if $providerType === MessagingProviderType.Email}
        <EmailFormList />
    {:else if $providerType === MessagingProviderType.Sms}
        <SmsFormList />
    {:else if $providerType === MessagingProviderType.Push}
        <PushFormList />
    {/if}
</WizardStep>
