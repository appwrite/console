<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { domain } from './store';
    import Retry from './retry.svelte';
    import { addNotification } from '$lib/stores/notifications';

    function onRetryError(event: CustomEvent<string>) {
        addNotification({
            title: 'Error',
            message: event.detail,
            type: 'error'
        });
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">{$domain.domain}</svelte:fragment>

    <div class="boxes-wrapper u-margin-block-start-24">
        <div class="box">
            {#if $domain.status === 'created'}
                <Retry on:error={onRetryError} />
            {:else}
                <div class="u-flex u-gap-8 u-cross-center">
                    <span
                        class="icon-check"
                        aria-hidden="true"
                        style="color: hsl(var(--color-success-100))" />
                    <p class="u-stretch">Domain verified</p>
                </div>
            {/if}
        </div>
        <div class="box">
            <div class="u-flex u-gap-8 u-cross-center">
                {#if $domain.status === 'verifying'}
                    <div
                        class="loader"
                        style="color: hsl(var(--color-neutral-50)); inline-size: 1.25rem; block-size: 1.25rem" />
                    <p class="u-stretch">Generating certificate</p>
                {:else if $domain.status === 'verified'}
                    <span
                        class="icon-check"
                        aria-hidden="true"
                        style="color: hsl(var(--color-success-100))" />
                    <p class="u-stretch">Certificate generated</p>
                {:else}
                    <span
                        class="icon-clock"
                        aria-hidden="true"
                        style="color: hsl(var(--color-neutral-50))" />
                    <p class="u-stretch">
                        Certificate generation will begin after domain verification
                    </p>
                {/if}
            </div>
        </div>
    </div>
</WizardStep>
