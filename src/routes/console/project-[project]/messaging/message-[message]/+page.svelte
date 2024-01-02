<script lang="ts">
    import { Container } from '$lib/layout';
    import Delete from './delete.svelte';
    import EmailPreview from './emailPreview.svelte';
    import Overview from './overview.svelte';
    import { message } from './store';
    import { ProviderTypes } from '../providerType.svelte';
</script>

<Container>
    <Overview />
    {#if $message.providerType === ProviderTypes.Email}
        <EmailPreview />
    {/if}
    <Delete />
</Container>
