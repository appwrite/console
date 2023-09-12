<script lang="ts">
    import { base } from '$app/paths';
    import { Card, CardGrid, Id } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { func, proxyRuleList } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { timer } from '$lib/actions/timer';
    import DeploymentSource from '../deploymentSource.svelte';
    import { deployment } from './store';
    import DeploymentCreatedBy from '../deploymentCreatedBy.svelte';
    import DeploymentDomains from '../deploymentDomains.svelte';
    import { tooltip } from '$lib/actions/tooltip';

    let logs = '';

    onMount(() => {
        logs = $deployment.buildLogs;
        if ($deployment.status === 'ready') {
            return;
        }
        return sdk.forConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (
                message.events.includes(
                    `functions.${$page.params.function}.deployments.${$page.params.deployment}.update`
                )
            ) {
                logs = message.payload.buildLogs;
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
            <div class="u-grid-equal-row-size u-gap-4 u-line-height-1">
                <p><b>Deployment ID</b></p>

                <Id value={$deployment.$id}>
                    {$deployment.$id}
                </Id>
            </div>
        </div>
        <svelte:fragment slot="aside">
            {@const status = $deployment.status}
            {@const fileSize = humanFileSize($deployment.size)}
            <div class="u-flex u-main-space-between">
                <div class="u-grid-equal-row-size u-gap-4 u-line-height-1">
                    <p>
                        <b>Build time:</b>
                        {#if ['processing', 'building'].includes($deployment.status)}
                            <span use:timer={{ start: $deployment.$createdAt }} />
                        {:else}
                            {calculateTime($deployment.buildTime)}
                        {/if}
                    </p>
                    <p><b>Updated:</b> <DeploymentCreatedBy deployment={$deployment} /></p>
                    <p>
                        <b>Size:</b>
                        {fileSize.value + fileSize.unit}
                        <span
                            class="icon-info"
                            aria-hidden="true"
                            style="font-size: var(--icon-size-small)"
                            use:tooltip={{
                                content:
                                    'Build size is the size of your code that will run. If your code has been transpiled, it will include your library source code. If it has been compiled, it will include your build output file.'
                            }} />
                    </p>
                    <p class="u-flex u-gap-4 u-cross-center">
                        <b>Source:</b>
                        <DeploymentSource deployment={$deployment} />
                    </p>
                    {#if $proxyRuleList?.rules?.length}
                        <p class="u-flex u-gap-4 u-cross-center">
                            <b>Domains:</b>
                            <DeploymentDomains domain={$proxyRuleList} />
                        </p>
                    {/if}
                </div>
                <div class="u-flex u-flex-vertical u-cross-end">
                    <Pill
                        danger={status === 'failed'}
                        warning={status === 'building'}
                        info={status === 'ready'}>
                        <span class="text u-trim">{$deployment.status}</span>
                    </Pill>
                </div>
            </div>
        </svelte:fragment>
    </CardGrid>

    <Card>
        <div class="u-stretch u-overflow-hidden">
            <section class="code-panel">
                <header
                    class="code-panel-header u-flex u-main-space-between u-width-full-line u-flex-wrap u-gap-16">
                    <div class="u-flex u-flex-vertical">
                        <h4 class="u-bold">Build {$func.name}</h4>
                        {#if $deployment.status === 'building'}
                            <span>Building...</span>
                        {:else}
                            <span class="u-capitalize">{$deployment.status}</span>
                        {/if}
                    </div>

                    <div class="u-flex u-gap-16">
                        <!-- TODO: add button once function is implemented -->
                        <!-- <Button disabled text>
                            <span class="icon-external-link" aria-hidden="true" /> Raw data</Button> -->
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
