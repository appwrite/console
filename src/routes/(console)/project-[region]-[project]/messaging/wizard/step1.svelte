<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { messageParams, providerType } from './store';
    import { providers } from '../providers/store';
    import EmailFormList from './emailFormList.svelte';
    import SmsFormList from './smsFormList.svelte';
    import PushFormList, { validateData } from './pushFormList.svelte';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { Button } from '@appwrite.io/pink-svelte';

    let docsUrl = `https://appwrite.io/docs/products/messaging`;

    const createMessage = (providerText: string) => {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const firstLetter = providerText.toLowerCase().charAt(0);
        const lastLetter = providerText.toLowerCase().charAt(providerText.length - 1);
        let article = vowels.includes(firstLetter) ? 'an' : 'a';
        article = lastLetter === 's' ? '' : article;

        providerText = providerText.toLowerCase() === 'sms' ? 'SMS messages' : providerText;
        return `Create ${article} ${providerText} that will be displayed to your subscribers.`;
    };

    switch ($providerType) {
        case MessagingProviderType.Email:
            docsUrl += '/send-email-messages';
            break;
        case MessagingProviderType.Sms:
            docsUrl += '/send-sms-messages';
            break;
        case MessagingProviderType.Push:
            docsUrl += '/send-push-notifications';
            break;
    }
</script>

<!-- This component is probably not used anymore... -->
<WizardStep
    nextDisabled={$providerType === MessagingProviderType.Push &&
        !!validateData($messageParams[MessagingProviderType.Push].data)}>
    <svelte:fragment slot="title">Message</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {createMessage(providers[$providerType].text)} Learn more in our
        <Button.Anchor href={docsUrl}>documentation</Button.Anchor>.
    </svelte:fragment>
    {#if $providerType === MessagingProviderType.Email}
        <EmailFormList />
    {:else if $providerType === MessagingProviderType.Sms}
        <SmsFormList />
    {:else if $providerType === MessagingProviderType.Push}
        <PushFormList />
    {/if}
</WizardStep>
