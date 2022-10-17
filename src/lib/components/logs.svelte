<script lang="ts">
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { log } from '$lib/stores/logs';
    import { Status } from '.';

    console.log('test');
</script>

{#if $log.deployment}
    {@const size = humanFileSize($log.deployment.size)}
    <section class="cover-frame">
        <header class="cover-frame-header u-flex u-gap-16 u-main-space-between u-cross-center">
            <h1 class="body-text-1" name="title">Function ID:</h1>
            <button on:click={() => ($log.show = false)} class="x-button" aria-label="close popup">
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>
        <div class="cover-frame-content u-flex u-flex-vertical">
            <div class="u-flex u-gap-16">
                <div class="avatar is-size-large">
                    <img height="28" width="28" src="" alt="Chrome" />
                </div>
                <div>
                    <h2 class="body-text-2">Deployment ID: {$log.deployment.$id}</h2>
                    <time class="u-block"
                        >Created at: {toLocaleDateTime($log.deployment.$createdAt)}</time>
                    <div>Size: {size.value} {size.unit}</div>
                </div>
                <Status status={$log.deployment.status} />
                <div class="status u-margin-inline-start-auto">
                    <time>TBI</time>
                </div>
            </div>
            <div class="tabs u-margin-block-start-48 u-sep-block-end">
                <ul class="tabs-list scroll-shadow-horizontal">
                    <li class="tabs-item">
                        <button class="tabs-button is-selected"
                            ><span class="text">Overview</span></button>
                    </li>
                    <li class="tabs-item">
                        <button class="tabs-button"><span class="text">Members</span></button>
                    </li>
                </ul>
            </div>
            <div class="theme-dark u-stretch u-margin-block-start-32 u-overflow-hidden">
                <section class="code-panel">
                    <header class="code-panel-header">
                        <div class="u-flex u-gap-16 u-margin-inline-start-auto">
                            <button class="button is-text">
                                <span class="icon-external-link" aria-hidden="true" />
                                <span class="text">Row data</span>
                            </button>
                            <button class="button is-secondary is-disabled">
                                <span class="icon-external-link" aria-hidden="true" />
                                <span class="text">Row data</span>
                            </button>
                        </div>
                    </header>
                    <code class="code-panel-content"> Code will be here </code>
                </section>
            </div>
        </div>
    </section>
{/if}
