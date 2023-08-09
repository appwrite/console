<script lang="ts">
    import { base } from '$app/paths';
    import { Card, CardGrid, Id } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { func } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { timer } from '$lib/actions/timer';
    import DeploymentSource from '../deploymentSource.svelte';

    export let data;

    let logs = '';

    onMount(() => {
        logs = data.deployment.buildLogs;
        if (data.deployment.status === 'ready') {
            return;
        }
        return sdk.forConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (
                message.events.includes(
                    `functions.${$page.params.function}.deployments.${$page.params.deployment}.update`
                )
            ) {
                logs = (message.payload as any).logs as string;
                if (message.payload.status === 'ready') {
                    invalidate(Dependencies.DEPLOYMENT);
                }
            }
        });
    });
</script>

<Container>
    <CardGrid>
        <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
            <div class="avatar is-medium" aria-hidden="true">
                <img
                    src={`${base}/icons/${$app.themeInUse}/color/${
                        $func.runtime.split('-')[0]
                    }.svg`}
                    alt="technology" />
            </div>
            <div>
                <div class="u-flex u-gap-12 u-cross-center">
                    <p><b>Deployment ID</b></p>
                </div>

                <div class="u-flex u-gap-12 u-cross-center">
                    <Id value={data.deployment.$id}>
                        {data.deployment.$id}
                    </Id>
                </div>
            </div>
        </div>
        <svelte:fragment slot="aside">
            {@const status = data.deployment.status}
            {@const fileSize = humanFileSize(data.deployment.size)}
            <div class="u-flex u-main-space-between">
                <div>
                    <p>
                        <b>Build time:</b>
                        {#if ['processing', 'building'].includes(data.deployment.status)}
                            <span use:timer={{ start: data.deployment.$createdAt }} />
                        {:else}
                            {calculateTime(data.deployment.buildTime)}
                        {/if}
                    </p>
                    <p><b>Created:</b> <deploymentCreatedBy deployment={data.deployment} /></p>
                    <p><b>Size:</b> {fileSize.value + fileSize.unit}</p>
                    <p>
                        <b>Source:</b>
                        <DeploymentSource deployment={data.deployment} />
                    </p>
                </div>
                <div class="u-flex u-flex-vertical u-cross-end">
                    <Pill
                        danger={status === 'failed'}
                        warning={status === 'pending'}
                        success={status === 'completed' || status === 'ready'}
                        info={status === 'processing' || status === 'building'}>
                        <span class="text u-trim">{data.deployment.status}</span>
                    </Pill>
                </div>
            </div>
        </svelte:fragment>
    </CardGrid>

    <Card>
        <div class="u-stretch u-margin-block-start-32 u-overflow-hidden">
            <section class="code-panel">
                <header class="code-panel-header u-flex u-main-space-between u-width-full-line">
                    <div class="u-flex u-flex-vertical">
                        <h4 class="u-bold">Build [{$func.name}]</h4>
                        <span>Building...</span>
                    </div>

                    <div class="u-flex u-gap-16">
                        <Button disabled text>
                            <span class="icon-external-link" aria-hidden="true" /> Raw data</Button>
                        <Button
                            secondary
                            on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <span class="icon-arrow-sm-up" aria-hidden="true" /> Scroll to top</Button>
                    </div>
                </header>
                <div class="code-panel-content">
                    <pre><code>{logs}</code></pre>
                </div>
            </section>
        </div>
    </Card>
</Container>
