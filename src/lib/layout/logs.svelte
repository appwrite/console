<script lang="ts">
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { log } from '$lib/stores/logs';
    import { Output, Status, Tab, Tabs } from '../components';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import type { Models } from '@aw-labs/appwrite-console';

    let selectedTab: string;
    let rawData: string;

    function isDeployment(
        data: Models.Deployment | Models.Execution<any>
    ): data is Models.Deployment {
        if ('buildId' in data) {
            selectedTab = 'logs';
            rawData = `${sdkForConsole.client.config.endpoint}/functions/${$log.func.$id}/deployment/${$log.data.$id}?mode=admin&project=${$page.params.project}`;
            return true;
        }
    }

    function isExecution(
        data: Models.Deployment | Models.Execution<any>
    ): data is Models.Execution<any> {
        if ('trigger' in data) {
            selectedTab = 'logs';
            rawData = `${sdkForConsole.client.config.endpoint}/functions/${$log.func.$id}/execution/${$log.data.$id}?mode=admin&project=${$page.params.project}`;
            return true;
        }
    }

    function scrollToTop() {
        document
            .getElementsByClassName('code-panel-content')[0]
            .scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            $log.show = false;
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $log.data}
    <section class="cover-frame" data-private>
        <header class="cover-frame-header u-flex u-gap-16 u-main-space-between u-cross-center">
            <h1 class="body-text-1" name="title">Function ID: {$log.func.$id}</h1>
            <button on:click={() => ($log.show = false)} class="x-button" aria-label="close popup">
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>
        {#if isDeployment($log.data)}
            {@const size = humanFileSize($log.data.size)}
            <div class="cover-frame-content u-flex u-flex-vertical">
                <div class="u-flex u-gap-16">
                    <div class="avatar is-size-large">
                        <img
                            height="28"
                            width="28"
                            src={`${base}/icons/${$app.themeInUse}/color/${
                                $log.func.runtime.split('-')[0]
                            }.svg`}
                            alt="technology" />
                    </div>
                    <div>
                        <div class="u-flex u-gap-12 u-cross-center">
                            <h2 class="body-text-2">Deployment ID:</h2>
                            <Output value={$log.data.$id}>
                                {$log.data.$id}
                            </Output>
                        </div>
                        <time class="u-block"
                            >Created at: {toLocaleDateTime($log.data.$createdAt)}</time>
                        <div>Size: {size.value} {size.unit}</div>
                    </div>
                    <div class="status u-margin-inline-start-auto">
                        <div class="u-flex u-flex-vertical u-cross-end">
                            <Status status={$log.data.status}>{$log.data.status}</Status>
                            <p class="text">
                                {calculateTime($log.data.buildTime)}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="tabs u-margin-block-start-48 u-sep-block-end">
                    <Tabs>
                        <Tab
                            selected={selectedTab === 'logs'}
                            on:click={() => (selectedTab = 'logs')}>
                            Logs
                        </Tab>
                        <Tab
                            selected={selectedTab === 'errors'}
                            on:click={() => (selectedTab = 'errors')}>
                            Errors
                        </Tab>
                    </Tabs>
                </div>
                <div class="theme-dark u-stretch u-margin-block-start-32 u-overflow-hidden">
                    <section class="code-panel">
                        <header class="code-panel-header">
                            <div class="u-flex u-gap-16 u-margin-inline-start-auto">
                                <Button text external href={rawData}>
                                    <span class="icon-external-link" aria-hidden="true" />
                                    <span class="text">Raw data</span>
                                </Button>
                                <Button secondary on:click={scrollToTop}>
                                    <span class="text">Scroll to top</span>
                                </Button>
                            </div>
                        </header>
                        {#if selectedTab === 'logs'}
                            <code class="code-panel-content">
                                {$log.data.buildStdout ?? 'No logs recorded'}
                            </code>
                        {:else}
                            <code class="code-panel-content">
                                {$log.data.buildStderr ?? 'No errors recorded'}
                            </code>
                        {/if}
                    </section>
                </div>
            </div>
        {:else if isExecution($log.data)}
            <div class="cover-frame-content u-flex u-flex-vertical">
                <div class="u-flex u-gap-16">
                    <div class="avatar is-size-large">
                        <img
                            height="28"
                            width="28"
                            src={`${base}/icons/${$app.themeInUse}/color/${
                                $log.func.runtime.split('-')[0]
                            }.svg`}
                            alt="technology" />
                    </div>
                    <div>
                        <div class="u-flex u-gap-12 u-cross-center">
                            <h2 class="body-text-2">Execution ID:</h2>
                            <Output value={$log.data.$id}>
                                {$log.data.$id}
                            </Output>
                        </div>
                        <time class="u-block">
                            Created at: {toLocaleDateTime($log.data.$createdAt)}</time>
                    </div>
                    <div>
                        <p>Triggered by: {$log.data.trigger}</p>
                    </div>
                    <div class="status u-margin-inline-start-auto">
                        <Status status={$log.data.status}>{$log.data.status}</Status>
                        <time>{calculateTime($log.data.duration)}</time>
                    </div>
                </div>
                <div class="tabs u-margin-block-start-48 u-sep-block-end">
                    <Tabs>
                        <Tab
                            selected={selectedTab === 'method'}
                            on:click={() => (selectedTab = 'method')}>
                            Method
                        </Tab>
                        <Tab
                            selected={selectedTab === 'path'}
                            on:click={() => (selectedTab = 'path')}>
                            Path and query
                        </Tab>
                        <Tab
                            selected={selectedTab === 'agent'}
                            on:click={() => (selectedTab = 'agent')}>
                            Agent
                        </Tab>
                        <Tab
                            selected={selectedTab === 'statusCode'}
                            on:click={() => (selectedTab = 'statusCode')}>
                            Status Code
                        </Tab>
                        <Tab
                            selected={selectedTab === 'logs'}
                            on:click={() => (selectedTab = 'logs')}>
                            Logs
                        </Tab>
                        <Tab
                            selected={selectedTab === 'errors'}
                            on:click={() => (selectedTab = 'errors')}>
                            Errors
                        </Tab>
                    </Tabs>
                </div>
                <div class="theme-dark u-stretch u-margin-block-start-32 u-overflow-hidden">
                    <section class="code-panel">
                        <header class="code-panel-header">
                            <div class="u-flex u-gap-16 u-margin-inline-start-auto">
                                <Button text external href={rawData}>
                                    <span class="icon-external-link" aria-hidden="true" />
                                    <span class="text">Raw data</span>
                                </Button>
                                <Button secondary on:click={scrollToTop}>
                                    <span class="text">Scroll to top</span>
                                </Button>
                            </div>
                        </header>
                        {#if selectedTab === 'logs'}
                            <code class="code-panel-content">
                                {$log.data.logs ? $log.data.logs : 'No logs.'}
                            </code>
                        {:else if selectedTab === 'errors'}
                            <code class="code-panel-content">
                                {$log.data.errors ? $log.data.errors : 'No errors.'}
                            </code>
                        {:else if selectedTab === 'statusCode'}
                            <code class="code-panel-content">
                                {$log.data.statusCode
                                    ? $log.data.statusCode
                                    : 'No response status code.'}
                            </code>
                        {:else if selectedTab === 'method'}
                            <code class="code-panel-content">
                                {$log.data.method ? $log.data.method : 'No request method.'}
                            </code>
                        {:else if selectedTab === 'agent'}
                            <code class="code-panel-content">
                                {$log.data.agent ? $log.data.agent : 'No request agent.'}
                            </code>
                        {:else if selectedTab === 'path'}
                            <code class="code-panel-content">
                                {$log.data.path ? $log.data.path : 'No request path.'}
                            </code>
                        {/if}
                    </section>
                </div>
            </div>
        {/if}
    </section>
{/if}
