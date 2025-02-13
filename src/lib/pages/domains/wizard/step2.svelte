<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { domain } from './store';
    import Retry from './retry.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Box } from '$lib/components';

    function onRetryError(event: CustomEvent<string>) {
        addNotification({
            message: event.detail,
            type: 'error'
        });
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">{$domain.domain}</svelte:fragment>

    <div class="boxes-wrapper u-margin-block-start-24">
        {#if $domain.status === 'created'}
            <Retry on:error={onRetryError} showTitle={false} />
        {:else}
            <div class="u-flex u-gap-8 u-cross-center">
                <span class="icon-check u-color-text-success" aria-hidden="true" />
                <p class="u-stretch">Domain verified</p>
            </div>
        {/if}
        <Box>
            <div class="u-flex u-gap-8 u-cross-center">
                {#if $domain.status === 'verifying'}
                    <div
                        class="loader"
                        style="color: hsl(var(--color-neutral-50)); inline-size: 1.25rem; block-size: 1.25rem" />
                    <p class="u-stretch">Generating certificate</p>
                {:else if $domain.status === 'verified'}
                    <span class="icon-check u-color-text-success" aria-hidden="true" />
                    <p class="u-stretch">Certificate generated</p>
                {:else}
                    <span class="icon-clock u-text-color-gray" aria-hidden="true" />
                    <p class="u-stretch">
                        Certificate generation will begin after domain verification
                    </p>
                {/if}
            </div>
        </Box>
    </div>
</WizardStep>
