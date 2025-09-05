<script lang="ts">
    import { Modal } from '$lib/components';
    import { Logs } from '@appwrite.io/pink-svelte';
    import { app } from '$lib/stores/app';
    import type { Models } from '@appwrite.io/console';

    let {
        show = $bindable(false),
        selectedProxyRule
    }: {
        show: boolean;
        selectedProxyRule: Models.ProxyRule;
    } = $props();
</script>

<Modal title="Certificate logs" bind:show size="m" hideFooter>
    <Logs
        logs={selectedProxyRule.logs}
        bind:theme={$app.themeInUse}
        showScrollButton
        height="250px" />
</Modal>
