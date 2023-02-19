<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';
    import { onMount } from 'svelte';

    onMount(async () => {
        const project = $page.url.searchParams.get('project');
        if (project) {
            await goto(`appwrite-callback-${project}://${$page.url.search}`);
        }
    });
</script>

<Heading tag="h1" size="1">Missing Redirect URL</Heading>
<p class="text">
    Your OAuth login flow is missing a proper redirect URL. Please check the
    <a class="link" href="https://appwrite.io/docs/client/account?sdk=web#createOAuth2Session"
        >OAuth docs</a>
    and send request for new session with a valid callback URL.
</p>
