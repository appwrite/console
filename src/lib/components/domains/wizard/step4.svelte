<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { sdkForConsole, sdkForProject } from '$lib/stores/sdk';
    import CnameTable from './cnameTable.svelte';
    import VerificationBox from './verificationBox.svelte';
    import { onDestroy, onMount } from 'svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import { rule } from './store';

    let status = 'verifying';

    let unsubscribe: { (): void };

    onMount(() => {
        unsubscribe = sdkForConsole.client.subscribe<Models.ProxyRule>('console', (response) => {
            if (response.events.includes(`rules.${$rule.$id}`)) {
                status = response.payload.status;
            }
        });
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    const checkCertificate = async () => {
        const result = await sdkForProject.proxy.getRule($rule.$id);
        status = result.status;
    };
    checkCertificate();
</script>

<WizardStep>
    <svelte:fragment slot="title">Add a CNAME record</svelte:fragment>
    <svelte:fragment slot="subtitle">
        In order to continue, set the following record on your DNS provider
    </svelte:fragment>

    <CnameTable />

    <div class="boxes-wrapper u-margin-block-start-24">
        <VerificationBox isVerifying={false} isVerified={true} />
        <div class="box">
            <div class="u-flex u-gap-16 u-cross-center">
                {#if status === 'verifying'}
                    <div
                        class="loader"
                        style="color: hsl(var(--color-neutral-50)); inline-size: 1.25rem; block-size: 1.25rem" />
                    <p class="u-stretch">Generating SSL certificate</p>
                {:else if status === 'unverified'}
                    <span
                        class="icon-x"
                        aria-hidden="true"
                        style="color: hsl(var(--color-neutral-50))" />
                    <p class="u-stretch">Generation of SSL certificate failed</p>
                {:else}
                    <span
                        class="icon-check"
                        aria-hidden="true"
                        style="color: hsl(var(--color-neutral-50))" />
                    <p class="u-stretch">Generated SSL certificate</p>
                {/if}
            </div>
        </div>
    </div>
</WizardStep>
