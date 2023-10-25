<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';
    import { Account, Client } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { VARS } from '$lib/system';

    const client = new Client();
    const account = new Account(client);

    onMount(async () => {
        const endpoint = VARS.APPWRITE_ENDPOINT ?? `${$page.url.origin}/v1`;
        const projectId = $page.url.searchParams.get('project');
        client.setEndpoint(endpoint).setProject(projectId);

        const userId = $page.url.searchParams.get('userId');
        const secret = $page.url.searchParams.get('secret');

        await account.updateMagicURLSession(userId, secret);
        await goto(`appwrite-callback-${projectId}://${$page.url.search}`);
    });
</script>

<Heading tag="h1" size="1">Missing Redirect URL</Heading>
<p>
    Your Magic URL login flow is missing a proper redirect URL. Please check the
    <a href="https://appwrite.io/docs/references/cloud/client-web/account#createMagicURLSession"
        >Magic URL docs</a>
    and send request for new session with a valid redirect URL.
</p>
