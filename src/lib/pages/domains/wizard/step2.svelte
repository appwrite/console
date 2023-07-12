<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { domain } from './store';
    import CNameTable from './cnameTable.svelte';

    async function retry() {
        try {
            $domain = await sdk.forProject.proxy.updateRuleVerification($domain.$id);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">{$domain.domain}</svelte:fragment>

    <div class="boxes-wrapper u-margin-block-start-24">
        <div class="box">
            {#if $domain.status === 'created'}
                <div class="u-flex u-gap-8 u-cross-center">
                    <span
                        class="icon-exclamation-circle"
                        aria-hidden="true"
                        style="color: hsl(var(--color-danger-100))" />
                    <p class="u-stretch">Verification failed</p>
                    <Button secondary on:click={retry}>Retry</Button>
                </div>
                <div class="u-margin-block-start-24">
                    <p>
                        In order to continue, set the following record on your DNS provider. Find a
                        list of domain providers and their DNS settings in our documentation.
                        Changes may take time to be effective.
                    </p>
                </div>
                <div class="u-margin-block-start-24">
                    <CNameTable />
                </div>
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
