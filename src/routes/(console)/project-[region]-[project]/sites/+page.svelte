<script lang="ts">
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';
    import { Heading, Empty } from '$lib/components';
    import EmptyLight from '$lib/images/empty-light.svg';
    import EmptyDark from '$lib/images/empty-dark.svg';
    import { isOnWaitlistSites, joinWaitlistSites } from '$lib/helpers/waitlist';
    import { page } from '$app/stores';

    $: isOnWaitlist = isOnWaitlistSites($page.url.pathname);
</script>

<Container>
    <article class="card u-grid u-cross-center u-width-full-line common-section">
        <div
            class="u-flex u-flex-vertical u-cross-center u-gap-24 u-width-full-line u-overflow-hidden u-padding-block-8">
            {#if $app.themeInUse === 'dark'}
                <img src={EmptyDark} alt="create" aria-hidden="true" height="242" />
            {:else}
                <img src={EmptyLight} alt="create" aria-hidden="true" height="242" />
            {/if}

            <slot>
                <div class="u-text-center">
                    <Heading size="7" tag="h2" trimmed={false}
                        >Appwrite Sites is in high demand.</Heading>
                    <p class="body-text-2 u-bold u-margin-block-start-4">
                        We have a waiting list to ensure a great experience for all of you. Please
                        join the waiting list to get access.
                    </p>
                </div>
                <div class="u-flex u-flex-wrap u-gap-16 u-main-center">
                    {#if isOnWaitlist}
                        We can't wait for you to try out Sites on Cloud.
                    {:else}
                        <Button
                            on:click={() => {
                                joinWaitlistSites();
                                isOnWaitlist = true;
                            }}>Join waitlist</Button>
                    {/if}
                </div>
            </slot>
        </div>
    </article>
    <!--    <div class="waitlist-container">-->
    <!--        {#if isOnWaitlistSites()}-->
    <!--            <Heading tag={'h1'} size={'7'}>Thanks for joining our waitlist</Heading>-->
    <!--            We can't wait for you to try out Sites on Cloud.<br />-->
    <!--            You will get access soon.-->
    <!--        {:else}-->
    <!--            <Heading tag={'h1'} size={'7'}>Appwrite Sites is in high demand.</Heading>-->
    <!--            <p>-->
    <!--                We have a waiting list to ensure a great experience for all of you.<br />Please join-->
    <!--                the waiting list to get access.-->
    <!--            </p>-->
    <!--            <Button-->
    <!--                on:click={() => {-->
    <!--                    joinWaitlistSites();-->
    <!--                    isOnWaitlist = true;-->
    <!--                }}>Join waitlist</Button>-->
    <!--        {/if}-->
    <!--    </div>-->
</Container>

<style>
    .waitlist-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
    }
</style>
