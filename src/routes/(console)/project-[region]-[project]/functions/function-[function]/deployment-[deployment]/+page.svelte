<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { func } from '../store';
    import { realtime, sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { deployment } from './store';
    import Heading from '$lib/components/heading.svelte';
    import BoxAvatar from '$lib/components/boxAvatar.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Delete from '../delete.svelte';
    import Activate from '../activate.svelte';
    import Cancel from '../cancel.svelte';
    import DeploymentCard from '../deploymentCard.svelte';

    export let data;

    let logs = '';
    let showDelete = false;
    let showCancel = false;
    let showActivate = false;

    let enableScrollButton = false;
    let codePanelContent: HTMLElement;

    function handleActivate() {
        invalidate(Dependencies.DEPLOYMENTS);
    }

    function getDownload(deploymentId: string) {
        return (
            sdk
                .forProject($page.params.region, $page.params.project)
                .functions.getDeploymentDownload($func.$id, deploymentId)
                .toString() + '&mode=admin'
        );
    }

    function handleScroll() {
        const threshold = codePanelContent.clientHeight * 0.25;
        enableScrollButton = codePanelContent.scrollTop > threshold;
    }

    onMount(() => {
        logs = $deployment.buildLogs;

        codePanelContent = document.querySelector('.code-panel-content');
        codePanelContent.addEventListener('scroll', handleScroll);

        if ($deployment.status === 'ready') {
            return;
        }

        const unsubscribe = realtime
            .forProject($page.params.region, $page.params.project)
            .subscribe<Models.Deployment>('console', (message) => {
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

        return () => {
            unsubscribe();
            codePanelContent.removeEventListener('scroll', handleScroll);
        };
    });
</script>

<Container>
    <DeploymentCard deployment={$deployment}>
        <svelte:fragment slot="actions">
            <div class="u-flex u-flex-wrap">
                {#if $deployment.status === 'processing' || $deployment.status === 'building' || $deployment.status === 'waiting'}
                    <Button
                        text
                        on:click={() => {
                            showCancel = true;
                        }}>Cancel</Button>
                {/if}

                {#if $deployment.size > 0}
                    <Button text href={getDownload($deployment.$id)}>Download code</Button>
                {/if}

                {#if $func.deployment !== $deployment.$id && $deployment.status === 'ready'}
                    <Button
                        secondary
                        disabled={data.activeDeployment}
                        on:click={() => {
                            showActivate = true;
                        }}>Activate</Button>
                {/if}
            </div>
        </svelte:fragment>
    </DeploymentCard>

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
                        disabled={!enableScrollButton}
                        on:click={() => codePanelContent?.scrollTo({ top: 0, behavior: 'smooth' })}>
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

<style>
    @media (max-width: 768px) {
        .code-panel-header {
            flex-direction: column;
        }
    }

    .code-panel-content {
        max-height: 50vh;
    }
</style>
