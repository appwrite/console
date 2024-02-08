<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { messageParams, providerType } from './store';
    import { providers } from '../providers/store';
    import { ProviderTypes } from '../providerType.svelte';
    import EmailFormList from './emailFormList.svelte';
    import SmsFormList from './smsFormList.svelte';
    import PushFormList, { validateData } from './pushFormList.svelte';

    async function beforeSubmit() {}

    const createMessage = (providerText:string) => {
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
    nextDisabled={$providerType === ProviderTypes.Push &&
        !!validateData($messageParams[ProviderTypes.Push].data)}>
    <svelte:fragment slot="title">Message</svelte:fragment>
    <svelte:fragment slot="subtitle">
        <!-- TODO: update documentation link -->
        {createMessage(providers[$providerType].text)}
    </svelte:fragment>
    {#if $providerType === ProviderTypes.Email}
        <EmailFormList />
    {:else if $providerType === ProviderTypes.Sms}
        <SmsFormList />
    {:else if $providerType === ProviderTypes.Push}
        <PushFormList />
    {/if}
</WizardStep>
