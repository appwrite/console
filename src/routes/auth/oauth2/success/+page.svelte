<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
    import { Heading } from '$lib/components';
    import { onMount } from 'svelte';

    onMount(async () => {
        const project = $page.url.searchParams.get('project');
        if (project) {
            await goto(`appwrite-callback-${project}://${$page.url.search}`);
        }
    });
</script>

<Heading tag="h1" size="1">{$LL.auth.title.missingRedirectUrl()}</Heading>
<p class="text">
    {$LL.auth.texts.oAuth.loginFlow()}
    <a class="link" href="https://appwrite.io/docs/client/account?sdk=web#createOAuth2Session"
        >{$LL.auth.texts.oAuth.oAuthDocs()}</a>
    {$LL.auth.texts.oAuth.sendRequest()}
</p>
