<script lang="ts">
    import { page } from '$app/state';
    import { Typography } from '@appwrite.io/pink-svelte';

    const project = page.url.searchParams.get('project');
    const link = `appwrite-callback-${project}://${page.url.search}`;

    const redirect = new Promise((_resolve, reject) => {
        if (!project) {
            reject('no-project');
        }
        window.location.href = link;
    });
</script>

{#await redirect then}
    <article class="card u-padding-16">
        <div class="u-flex u-flex-vertical u-gap-16">
            <Typography.Title>Login failed</Typography.Title>
            <p class="text">You will be automatically redirected back to your app shortly.</p>
            <p class="text">
                If you are not redirected, please click on the following
                <a class="link" href={`appwrite-callback-${project}://${page.url.search}`}>link</a>.
            </p>
        </div>
    </article>
{:catch}
    <article class="card u-padding-16">
        <div class="u-flex u-flex-vertical u-gap-16">
            <Typography.Title>Missing redirect URL</Typography.Title>
            <p class="text">
                Your OAuth login flow is missing a proper redirect URL. Please check the
                <a
                    class="link"
                    href="https://appwrite.io/docs/references/cloud/client-web/account#createOAuth2Session"
                    >OAuth docs</a>
                and send request for new session with a valid callback URL.
            </p>
        </div>
    </article>
{/await}

<style lang="scss">
    @use '@appwrite.io/pink-legacy/src/abstract/variables/devices';
    // override padding for screens bigger than mobile
    @media #{devices.$break2open} {
        article.card {
            padding: 2rem !important;
        }
    }
</style>
