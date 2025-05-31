<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { type Models } from '@appwrite.io/console';
    import { page } from '$app/state';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Activate from '../(modals)/activateModal.svelte';
    import Cancel from '../(modals)/cancelDeploymentModal.svelte';
    import DeploymentCard from '../(components)/deploymentCard.svelte';
    import Delete from '../(modals)/deleteModal.svelte';
    import {
        Accordion,
        ActionMenu,
        Card,
        Icon,
        Layout,
        Logs,
        Spinner,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { timer } from '$lib/actions/timer';
    import { app } from '$lib/stores/app';
    import { IconDotsHorizontal, IconRefresh } from '@appwrite.io/pink-icons-svelte';
    import { Menu } from '$lib/components/menu';
    import { canWriteFunctions } from '$lib/stores/roles';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import DownloadActionMenuItem from '../(components)/downloadActionMenuItem.svelte';
    import { base } from '$app/paths';
    import { isCloud } from '$lib/system';
    import { readOnly } from '$lib/stores/billing';
    import RedeployModal from '../(modals)/redeployModal.svelte';

    export let data;

    let showDelete = false;
    let showCancel = false;
    let showActivate = false;
    let showRedeploy = false;

    onMount(() => {
        const unsubscribe = sdk.forConsole.client.subscribe<Models.Deployment>(
            'console',
            (message) => {
                if (
                    message.events.includes(
                        `functions.${page.params.function}.deployments.${page.params.deployment}.update`
                    )
                ) {
                    if (message.payload.status === 'ready') {
                        invalidate(Dependencies.DEPLOYMENT);
                    }
                }
            }
        );

        return () => {
            unsubscribe();
        };
    });

    export function badgeTypeDeployment(status: string) {
        switch (status) {
            case 'failed':
                return 'error';
            case 'ready':
                return 'success';
            case 'building':
                return 'warning';
            case 'processing':
                return undefined;
            default:
                return undefined;
        }
    }
</script>

<Container>
    <DeploymentCard proxyRuleList={data.proxyRuleList} deployment={data.deployment}>
        {#snippet footer()}
            <Layout.Stack direction="row" alignItems="center" inline>
                {#if data.deployment.status === 'processing' || data.deployment.status === 'building' || data.deployment.status === 'waiting'}
                    <Button
                        text
                        on:click={() => {
                            showCancel = true;
                        }}>Cancel</Button>
                {/if}

                <Menu>
                    <Button secondary icon text>
                        <Icon icon={IconDotsHorizontal} />
                    </Button>
                    <svelte:fragment slot="menu" let:toggle>
                        <ActionMenu.Root>
                            {#if $canWriteFunctions}
                                <ActionMenu.Item.Button
                                    trailingIcon={IconRefresh}
                                    on:click={() => {
                                        showRedeploy = true;
                                        trackEvent(Click.FunctionsRedeployClick);
                                        toggle();
                                    }}>
                                    Redeploy
                                </ActionMenu.Item.Button>
                            {/if}
                            {#if !!data.deployment?.sourceSize || !!data.deployment?.sourceSize}
                                <DownloadActionMenuItem deployment={data.deployment} {toggle} />
                            {/if}
                        </ActionMenu.Root>
                    </svelte:fragment>
                </Menu>
                {#if data.func.deploymentId === data.deployment.$id && data.deployment.status === 'ready'}
                    <Button
                        href={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/executions/execute-function`}
                        disabled={isCloud && $readOnly}>
                        Execute
                    </Button>
                {/if}

                {#if data.func.deploymentId !== data.deployment.$id && data.deployment.status === 'ready'}
                    <Button
                        disabled={data.activeDeployment}
                        on:click={() => {
                            showActivate = true;
                        }}>Activate</Button>
                {/if}
            </Layout.Stack>
        {/snippet}
    </DeploymentCard>

    <Card.Base padding="s">
        <Accordion
            title="Deployment logs"
            badge={capitalize(data.deployment.status)}
            open
            badgeType={badgeTypeDeployment(data.deployment.status)}
            hideDivider>
            <Layout.Stack gap="xl">
                {#key data.deployment.buildLogs}
                    <Logs
                        showScrollButton
                        logs={data.deployment.buildLogs || 'No logs available yet...'}
                        bind:theme={$app.themeInUse} />
                {/key}
            </Layout.Stack>

            <svelte:fragment slot="end">
                <Layout.Stack direction="row" alignItems="center" inline>
                    {#if ['processing', 'building'].includes(data.deployment.status)}
                        <Typography.Code color="--fgcolor-neutral-secondary">
                            <Layout.Stack direction="row" alignItems="center" inline>
                                <p use:timer={{ start: data.deployment.$createdAt }}></p>
                                <Spinner size="s" />
                            </Layout.Stack>
                        </Typography.Code>
                    {:else}
                        <Typography.Code color="--fgcolor-neutral-secondary">
                            {formatTimeDetailed(data.deployment.buildDuration)}
                        </Typography.Code>
                    {/if}
                </Layout.Stack>
            </svelte:fragment>
        </Accordion>
    </Card.Base>
</Container>

<Delete selectedDeployment={data.deployment} bind:showDelete />
<Cancel selectedDeployment={data.deployment} bind:showCancel />
<Activate
    selectedDeployment={data.deployment}
    bind:showActivate
    on:activated={() => invalidate(Dependencies.DEPLOYMENTS)} />

{#if showRedeploy}
    <RedeployModal bind:show={showRedeploy} selectedDeployment={data.deployment} redirect />
{/if}
