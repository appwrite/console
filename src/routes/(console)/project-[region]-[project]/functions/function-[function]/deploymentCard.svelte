<script lang="ts">
    import { CardGrid, Id, SvgIcon } from '$lib/components';
    import type { Models } from '@appwrite.io/console';
    import { func, proxyRuleList } from './store';
    import { Pill } from '$lib/elements';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import DeploymentBy from './deploymentBy.svelte';
    import DeploymentSource from './deploymentSource.svelte';

    import DeploymentDomains from './deploymentDomains.svelte';
    import { tooltip } from '$lib/actions/tooltip';

    export let deployment: Models.Deployment;
</script>

<CardGrid>
    <div class="u-flex u-cross-start u-gap-16">
        <div class="avatar" style={`--p-image-size: ${32 / 16}rem`} aria-hidden="true">
            <SvgIcon size={64} iconSize="large" name={$func.runtime.split('-')[0]}></SvgIcon>
        </div>
        <div class="u-grid-equal-row-size u-gap-4 u-line-height-1">
            <p><b>Deployment ID</b></p>

            <Id value={deployment.$id}>
                {deployment.$id}
            </Id>
        </div>
    </div>
    <svelte:fragment slot="aside">
        {@const status = deployment.status}
        {@const deploymentSize = humanFileSize(deployment.size)}
        {@const buildSize = humanFileSize(deployment.buildSize)}
        {@const totalSize = humanFileSize(deployment.buildSize + deployment.size)}
        <ul class="stats-grid-box u-gap-16">
            <li class="u-flex-vertical u-gap-4">
                <p class="u-color-text-offline">Status</p>
                <span>
                    <Pill
                        danger={status === 'failed'}
                        warning={status === 'building'}
                        success={status === 'ready'}>
                        <span class="icon-lightning-bolt" aria-hidden="true" />
                        <span class="text u-trim">
                            {status === 'ready' ? 'active' : status}
                        </span>
                    </Pill>
                </span>
            </li>
            <li class="u-flex-vertical u-gap-4">
                <p class="u-color-text-offline">Build time</p>
                <p class="u-line-height-2">
                    {calculateTime(deployment.buildTime)}
                </p>
            </li>
            <li class="u-flex-vertical u-gap-4">
                <p class="u-color-text-offline">Total size</p>
                <p class="u-line-height-2">
                    {totalSize.value + totalSize.unit}
                    <button
                        type="button"
                        on:click|preventDefault
                        class="tooltip"
                        aria-label="input tooltip"
                        use:tooltip={{
                            content: `
                                <p><b>Deployment size:</b> ${deploymentSize.value + deploymentSize.unit}</p>
                                <p><b>Build size:</b> ${buildSize.value + buildSize.unit}</p>
                            `,
                            allowHTML: true,
                            appendTo: 'parent'
                        }}>
                        <span
                            class="icon-info"
                            aria-hidden="true"
                            style="font-size: var(--icon-size-small)" />
                    </button>
                </p>
            </li>
            <li class="u-flex-vertical u-gap-4">
                <p class="u-color-text-offline">Updated</p>
                <p class="u-line-height-2">
                    <DeploymentBy {deployment} type="update" />
                </p>
            </li>
        </ul>

        <div class="u-flex u-flex-vertical u-gap-4">
            <p class="u-color-text-offline">Source</p>
            <div>
                <DeploymentSource {deployment} />
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
        <slot name="actions" />
    </svelte:fragment>
</CardGrid>

<style lang="scss">
    @use '@appwrite.io/pink/src/abstract/variables/devices';

    .stats-grid-box {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }

    @media #{devices.$break3open} {
        .stats-grid-box {
            grid-template-columns: repeat(4, 1fr);
        }
    }
</style>
