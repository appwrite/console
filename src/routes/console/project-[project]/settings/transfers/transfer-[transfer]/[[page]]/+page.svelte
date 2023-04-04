<script lang="ts">
    import { browser } from '$app/environment';
    import { invalidate } from '$app/navigation';
    import CardGrid from '$lib/components/cardGrid.svelte';
    import Output from '$lib/components/output.svelte';
    import Status from '$lib/components/status.svelte';
    import { Dependencies } from '$lib/constants';
    import Button from '$lib/elements/forms/button.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { execute, transfer } from '../store';
    // import type { PageData } from './$types';

    //let data: PageData;

    if (browser) {
        sdkForConsole.client.subscribe<Models.Transfer>('console', (message) => {
            if (message.events.includes('transfers.*.create')) {
                invalidate(Dependencies.TRANSFERS);

                return;
            }

            if (message.events.includes('transfers.*.update')) {
                invalidate(Dependencies.TRANSFERS);
                invalidate(Dependencies.TRANSFER);

                return;
            }

            if (message.events.includes('transfers.*.delete')) {
                invalidate(Dependencies.TRANSFERS);
                invalidate(Dependencies.TRANSFER);

                return;
            }
        });
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <CardGrid>
            <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
                <div class="avatar is-medium" aria-hidden="true">🛫</div>
                <div>
                    <div class="u-flex u-gap-12 u-cross-center">
                        <p><b>Transfer ID: </b></p>
                        <Output value={$transfer.$id}><b>{$transfer.$id}</b></Output>
                    </div>
                </div>
            </div>
            <svelte:fragment slot="aside">
                <div class="u-flex u-main-space-between">
                    <div>
                        <p>Created at: {toLocaleDateTime($transfer.$createdAt)}</p>
                        <p>Updated at: {toLocaleDateTime($transfer.$updatedAt)}</p>
                    </div>
                    <div class="u-flex u-flex-vertical u-cross-end">
                        <Status status={$transfer.status}>
                            {$transfer.status}
                        </Status>
                        <!-- <p class="text">
                            
                        </p> -->
                    </div>
                </div>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => execute.set($transfer)}>Retry</Button>
            </svelte:fragment>
        </CardGrid>
    </div>
</Container>
