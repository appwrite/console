<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { messageParams, providerType } from './store';
    import { providers } from '../providers/store';
    import EmailFormList from './emailFormList.svelte';
    import SmsFormList from './smsFormList.svelte';
    import PushFormList, { validateData } from './pushFormList.svelte';
    import { MessagingProviderType } from '@appwrite.io/console';

    async function beforeSubmit() {}

    const createMessage = (providerText: string) => {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const firstLetter = providerText.toLowerCase().charAt(0);
        const lastLetter = providerText.toLowerCase().charAt(providerText.length - 1);
        let article = vowels.includes(firstLetter) ? 'an' : 'a';
        article = lastLetter === 's' ? '' : article;

        providerText = providerText.toLowerCase() === 'sms' ? 'SMS messages' : providerText;
        return `Create ${article} ${providerText} that will be displayed to your subscribers. Learn more in our documentation.`;
    };
</script>

<WizardStep
    {beforeSubmit}
    nextDisabled={$providerType === MessagingProviderType.Push &&
        !!validateData($messageParams[MessagingProviderType.Push].data)}>
    <svelte:fragment slot="title">Message</svelte:fragment>
    <svelte:fragment slot="subtitle">
        <!-- TODO: update documentation link -->
        {createMessage(providers[$providerType].text)}
    </svelte:fragment>
    {#if $providerType === MessagingProviderType.Email}
        <EmailFormList />
    {:else if $providerType === MessagingProviderType.Sms}
        <SmsFormList />
    {:else if $providerType === MessagingProviderType.Push}
        <PushFormList />
    {/if}
</WizardStep>
