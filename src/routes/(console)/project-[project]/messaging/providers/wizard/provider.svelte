<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { providerType, provider, providerParams } from './store';
    import { CustomId, LabelCard } from '$lib/components';
    import { providers } from '../store';
    import { InputText } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { Providers } from '../../provider.svelte';
    import { SmtpEncryption } from '@appwrite.io/console';

    let name = '';
    let showCustomId = false;
    let id: string = null;

    async function beforeSubmit() {
        switch ($provider) {
            case Providers.Twilio:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    accountSid: '',
                    authToken: '',
                    from: ''
                };
                break;
            case Providers.Msg91:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    templateId: '',
                    senderId: '',
                    authKey: ''
                };
                break;
            case Providers.Telesign:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    customerId: '',
                    apiKey: '',
                    from: ''
                };
                break;
            case Providers.Textmagic:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    username: '',
                    apiKey: '',
                    from: ''
                };
                break;
            case Providers.Vonage:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    apiKey: '',
                    apiSecret: '',
                    from: ''
                };
                break;
            case Providers.Mailgun:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    isEuRegion: false,
                    fromEmail: '',
                    fromName: '',
                    replyToEmail: '',
                    replyToName: '',
                    apiKey: '',
                    domain: ''
                };
                break;
            case Providers.Sendgrid:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    apiKey: '',
                    fromEmail: '',
                    fromName: '',
                    replyToEmail: '',
                    replyToName: ''
                };
                break;
            case Providers.SMTP:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    host: '',
                    port: 587,
                    username: '',
                    password: '',
                    autoTLS: true,
                    encryption: SmtpEncryption.Tls,
                    mailer: '',
                    fromEmail: '',
                    fromName: '',
                    replyToEmail: '',
                    replyToName: ''
                };
                break;
            case Providers.FCM:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    serviceAccountJSON: ''
                };
                break;
            case Providers.APNS:
                $providerParams[$provider] = {
                    providerId: id,
                    name: name,
                    enabled: true,
                    authKey: '',
                    authKeyId: '',
                    teamId: '',
                    bundleId: '',
                    sandbox: false
                };
                break;
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Provider</svelte:fragment>
    <div class="u-sep-block-start u-padding-block-end-32" />

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
                icon={option.classIcon ?? option.imageIcon}>
                <svelte:fragment slot="title">{option.title}</svelte:fragment>
                {#if option.description}
                    {option.description}
                {/if}
            </LabelCard>
        {/each}
    </div>
</WizardStep>

<style lang="scss">
    .grid-box {
        --grid-gap: 1rem;
        grid-template-columns: 1fr 1fr;
        grid-auto-rows: auto;
    }

    :global(body:not(.theme-dark)) .grid-box :global(.card) {
        --p-card-bg-color-default: var(--color-neutral-5);
        --p-card-bg-color-hover: var(--color-neutral-10);
    }
</style>
