<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid, Id } from '$lib/components';
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
    import DeploymentSource from '../deploymentSource.svelte';
    import { deployment } from './store';
    import DeploymentCreatedBy from '../deploymentCreatedBy.svelte';
    import DeploymentDomains from '../deploymentDomains.svelte';
    import Heading from '$lib/components/heading.svelte';
    import BoxAvatar from '$lib/components/boxAvatar.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Delete from '../delete.svelte';
    import Activate from '../activate.svelte';
    import Cancel from '../cancel.svelte';

    export let data;

    let logs = '';
    let showDelete = false;
    let showCancel = false;
    let showActivate = false;

    function handleActivate() {
        invalidate(Dependencies.DEPLOYMENTS);
    }

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
                logs = message.payload['logs'];
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
            <div class="stats-grid-box">
                <div>
                    <p class="u-color-text-offline">Status</p>
                    <Pill
                        danger={status === 'failed'}
                        warning={status === 'processing'}
                        success={status === 'ready'}
                        info={status === 'building'}>
                        {#if data.activeDeployment}
                            <span class="icon-lightning-bolt" aria-hidden="true" />
                        {:else if $deployment.status === 'canceled'}
                            <span class="icon-x-circle" aria-hidden="true" />
                        {/if}
                        <span class="text u-trim">
                            {data.activeDeployment ? 'active' : $deployment.status}
                        </span>
                    </Pill>
                </div>
                <div>
                    <p class="u-color-text-offline">Build time</p>
                    <p class="u-line-height-2">
                        {calculateTime($deployment.buildTime)}
                    </p>
                </div>
                <div>
                    <p class="u-color-text-offline">Build size</p>
                    <p class="u-line-height-2">
                        {fileSize.value + fileSize.unit}
                    </p>
                </div>
                <div>
                    <p class="u-color-text-offline">Updated</p>
                    <p class="u-line-height-2">
                        <DeploymentCreatedBy deployment={$deployment} />
                    </p>
                </div>
            </div>

            <div class="u-flex u-flex-vertical u-gap-4">
                <p class="u-color-text-offline">Source</p>
                <div>
                    <DeploymentSource deployment={$deployment} />
                </div>
            </div>

            {#if $proxyRuleList?.rules?.length}
                <div class="u-flex u-flex-vertical u-gap-4">
                    <p class="u-color-text-offline">Domains</p>
                    <DeploymentDomains domain={$proxyRuleList} />
                </div>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <div class="u-flex u-flex-wrap">
                {#if $deployment.status === 'processing'}
                    <Button
                        text
                        class="u-margin-inline-end-16"
                        on:click={() => {
                            showCancel = true;
                        }}>Cancel</Button>
                {/if}
                <Button
                    secondary
                    disabled={data.activeDeployment}
                    on:click={() => {
                        showDelete = true;
                    }}>Activate</Button>
            </div>
        </svelte:fragment>
    </CardGrid>

    <div class="u-stretch u-overflow-hidden u-padding-block-start-24">
        <section class="code-panel" style="border-radius: var(--border-radius-medium);">
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

    {#if !data.activeDeployment}
        <CardGrid danger>
            <Heading tag="h6" size="7">Delete deployment</Heading>
            <p>
                The deployment will be permanently deleted, including all data associated with it.
                This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <BoxAvatar>
                    <p>Last updated: {toLocaleDateTime($func.$updatedAt)}</p>
                </BoxAvatar>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete selectedDeployment={$deployment} bind:showDelete />
<Cancel selectedDeployment={$deployment} bind:showCancel />
<Activate selectedDeployment={$deployment} bind:showActivate on:activated={handleActivate} />

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';
    .stats-grid-box {
        display: grid;
        gap: px2rem(16);
        grid-template-columns: repeat(2, 1fr);
    }
    @media #{$break3open} {
        .stats-grid-box {
            grid-template-columns: repeat(4, 1fr);
        }
    }
</style>
