<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Heading } from '$lib/components';

    const project = $page.url.searchParams.get('project');
    const link = `appwrite-callback-${project}://${$page.url.search}`;

    const redirect = new Promise((resolve, reject) => {
        if (!project) {
            reject('no-project');
        }
        // this timeout is needed because goto does not
        // throw an exception if the redirect does not work
        setTimeout(() => reject('timeout'), 500);
        // goto will resolve on successful redirect
        goto(link).then(resolve);
    });
</script>

{#await redirect then}
    <article class="card u-padding-16">
        <div class="u-flex u-flex-vertical u-gap-16">
            <Heading tag="h1" size="4">Login failed</Heading>
            <p class="text">You will be automatically redirected back to your app shortly.</p>
            <p class="text">
                If you are not redirected, please click on the following
                <a class="link" href={`appwrite-callback-${project}://${$page.url.search}`}>link</a
                >.
            </p>
        </div>
    </article>
{:catch}
    <article class="card u-padding-16">
        <div class="u-flex u-flex-vertical u-gap-16">
            <Heading tag="h1" size="4">Missing Redirect URL</Heading>
            <p class="text">
                Your OAuth login flow is missing a proper redirect URL. Please check the
                <a
                    class="link"
                    href="https://appwrite.io/docs/client/account?sdk=web#createOAuth2Session"
                    >OAuth docs</a>
                and send request for new session with a valid callback URL.
            </p>
        </div>
    </article>
{/await}

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';
    // override padding for screens bigger than mobile
    @media #{$break2open} {
        article.card {
            padding: 2rem !important;
        }
    }
</style>
