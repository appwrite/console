<script lang="ts">
    import { Container } from '$lib/layout';
    import Delete from './delete.svelte';
    import EmailPreview from './emailPreview.svelte';
    import Overview from './overview.svelte';
    import { message } from './store';
    import { ProviderTypes } from '../providerType.svelte';
    import SMSPreview from './smsPreview.svelte';
    import PushPreview from './pushPreview.svelte';
</script>

<Container>
    <Overview />
    {#if $message.providerType === ProviderTypes.Email}
        <EmailPreview />
    {:else if $message.providerType === ProviderTypes.Sms}
        <SMSPreview />
    {:else if $message.providerType === ProviderTypes.Push}
        <PushPreview />
    {/if}
    <Delete />
</Container>
