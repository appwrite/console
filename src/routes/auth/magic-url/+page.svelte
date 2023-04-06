<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';
    import { Account, Client } from '@aw-labs/appwrite-console';
    import { onMount } from 'svelte';

    const client = new Client();
    const account = new Account(client);

    onMount(async () => {
        const projectId = $page.url.searchParams.get('project');
        client.setEndpoint(`${$page.url.origin}/v1`).setProject(projectId);

        const userId = $page.url.searchParams.get('userId');
        const secret = $page.url.searchParams.get('secret');

        await account.updateMagicURLSession(userId, secret);
        await goto(`appwrite-callback-${projectId}://${$page.url.search}`);
    });
</script>

<Heading tag="h1" size="1">Missing Redirect URL</Heading>
<p>
    Your Magic URL login flow is missing a proper redirect URL. Please check the
    <a href="https://appwrite.io/docs/client/account?sdk=web#createMagicURLSession"
        >Magic URL docs</a>
    and send request for new session with a valid redirect URL.
</p>
