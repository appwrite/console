<script lang="ts">
    import { Alert } from '@appwrite.io/pink-svelte';

    let { product }: { product: 'site' | 'function' } = $props();
</script>

{#if product === 'site'}
    <Alert.Inline status="info" title="Logs are unavailable on self-hosted Appwrite">
        To reduce storage overhead, self-hosted Appwrite no longer stores logs or error output. As a
        result, this section may be empty. You can still view log status, duration, and response
        code. Full logs remain available on Appwrite Cloud.
    </Alert.Inline>
{:else}
    <Alert.Inline status="info" title="Execution logs are unavailable on self-hosted Appwrite">
        To reduce storage overhead, self-hosted Appwrite no longer stores function logs or error
        output. As a result, this section may be empty. You can still view execution status,
        duration, and response code. Full execution logs remain available on Appwrite Cloud.
    </Alert.Inline>
{/if}
