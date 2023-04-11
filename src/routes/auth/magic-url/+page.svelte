<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';
    import { onMount } from 'svelte';

    onMount(async () => {
        const projectId = $page.url.searchParams.get('project');
        await goto(`appwrite-callback-auth-${projectId}://appwrite.io/magic-url${$page.url.search}`);
    });
</script>

<Heading tag="h1" size="1">Missing Redirect URL</Heading>
<p>
    Your Magic URL login flow is missing a proper redirect URL. Please check the
    <a href="https://appwrite.io/docs/client/account?sdk=web#createMagicURLSession"
        >Magic URL docs</a>
    and send request for new session with a valid redirect URL.
</p>
