<script lang="ts">
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';
    import { Heading } from '$lib/components';
    import EmptyLight from './empty-sites-light.svg';
    import EmptyDark from './empty-sites-dark.svg';
    import { isOnWaitlistSites, joinWaitlistSites } from '$lib/helpers/waitlist';
    import { addNotification } from '$lib/stores/notifications';

    $: isOnWaitlist = isOnWaitlistSites();
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
                {#if isOnWaitlist}
                    <div class="u-text-center">
                        <Heading size="7" tag="h2" trimmed={false}
                            >You've successfully joined the Sites waitlist
                        </Heading>
                        <p class="body-text-2 u-margin-block-start-4" style="max-width: 600px;">
                            We can't wait for you to try out Sites on Cloud. You will get access
                            soon.
                        </p>
                    </div>
                {:else}
                    <div class="u-text-center">
                        <Heading size="7" tag="h2" trimmed={false}
                            >Appwrite Sites is in high demand</Heading>
                        <p class="body-text-2 u-margin-block-start-4" style="max-width: 600px;">
                            To ensure a smooth experience for everyone, we’re rolling out access
                            gradually. Join the waitlist and be one of the first to deploy with
                            Sites.
                        </p>
                    </div>
                    <div class="u-flex u-flex-wrap u-gap-16 u-main-center">
                        <Button
                            on:click={() => {
                                joinWaitlistSites();
                                addNotification({
                                    title: 'Waitlist joined',
                                    message:
                                        'We’ll let you know as soon as Appwrite Sites is ready for you.',
                                    type: 'success'
                                });
                                isOnWaitlist = true;
                            }}>Join waitlist</Button>
                    </div>
                {/if}
            </slot>
        </div>
    </article>
</Container>

<style>
    article {
        margin-top: -100px;
    }
</style>
