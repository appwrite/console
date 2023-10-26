<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { providerType, provider, providerParams } from './store';
    import { CustomId, LabelCard } from '$lib/components';
    import { providers } from '../store';
    import { FormList, InputText } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { Providers } from '../../provider.svelte';

    let name = '';
    let showCustomId = false;
    let id: string = null;

    async function beforeSubmit() {
        console.log($provider);

        switch ($provider) {
            case Providers.Twilio:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    default: false,
                    enabled: false,
                    accountSid: '',
                    authToken: '',
                    from: ''
                };
                break;
            case Providers.Msg91:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    default: false,
                    enabled: false,
                    from: '',
                    senderId: '',
                    authKey: ''
                };
                break;
            case Providers.Telesign:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    default: false,
                    enabled: false,
                    username: '',
                    password: '',
                    from: ''
                };
                break;
            case Providers.Textmagic:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    default: false,
                    enabled: false,
                    username: '',
                    apiKey: '',
                    from: ''
                };
                break;
            case Providers.Vonage:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    default: false,
                    enabled: false,
                    apiKey: '',
                    apiSecret: '',
                    from: ''
                };
                break;
            case Providers.Mailgun:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    default: false,
                    enabled: false,
                    isEuRegion: false,
                    from: '',
                    apiKey: '',
                    domain: ''
                };
                break;
            case Providers.Sendgrid:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    default: false,
                    enabled: false,
                    apiKey: '',
                    from: ''
                };
                break;
            case Providers.FCM:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    default: false,
                    enabled: false,
                    serverKey: ''
                };
                break;
            case Providers.APNS:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    default: false,
                    enabled: false,
                    authKey: '',
                    authKeyId: '',
                    teamId: '',
                    bundleId: ''
                };
                break;
            case Providers.MQTT:
                break;
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Provider</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="Provider name"
            bind:value={name}
            autofocus
            required />

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Provider ID
                    </span></Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Provider" bind:id autofocus={false} />
        {/if}
        <p class="u-margin-block-start-24">
            Select a provider you would like to enable for sending {providers[$providerType].text}.
        </p>
        <div class="grid-box">
            {#each Object.entries(providers[$providerType].providers) as [value, option]}
                <LabelCard
                    name="provider"
                    {value}
                    bind:group={$provider}
                    imageIcon={option.imageIcon}>
                    <svelte:fragment slot="title">{option.title}</svelte:fragment>
                    {#if option.description}
                        {option.description}
                    {/if}
                </LabelCard>
            {/each}
        </div>
    </FormList>
</WizardStep>
