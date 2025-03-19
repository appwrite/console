<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { DeploymentDownloadType, type Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Activate from '../(modals)/activateModal.svelte';
    import Cancel from '../(modals)/cancel.svelte';
    import DeploymentCard from '../(components)/deploymentCard.svelte';
    import Delete from '../(modals)/deleteModal.svelte';
    import { Accordion, Card, Layout, Logs, Spinner, Typography } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { timer } from '$lib/actions/timer';
    import { app } from '$lib/stores/app';

    export let data;

    let logs = '';
    let showDelete = false;
    let showCancel = false;
    let showActivate = false;

    function handleActivate() {
        invalidate(Dependencies.DEPLOYMENTS);
    }

    //TODO: implement output download
    function getDownload(deploymentId: string) {
        return (
            sdk.forProject.functions.getDeploymentDownload(data.func.$id, deploymentId).toString() +
                '&mode=admin',
            DeploymentDownloadType.Source
        );
    }

    onMount(() => {
        logs = data.deployment.buildLogs;

        const unsubscribe = sdk.forConsole.client.subscribe<Models.Deployment>(
            'console',
            (message) => {
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

    $: console.log(logs);
    $: console.log(data.deployment);
</script>

<Container>
    <DeploymentCard proxyRuleList={data.proxyRuleList} deployment={data.deployment}>
        <svelte:fragment slot="footer">
            <Layout.Stack direction="row" inline>
                {#if data.deployment.status === 'processing' || data.deployment.status === 'building' || data.deployment.status === 'waiting'}
                    <Button
                        text
                        on:click={() => {
                            showCancel = true;
                        }}>Cancel</Button>
                {/if}

                {#if data.deployment.sourceSize > 0}
                    <Button secondary href={getDownload(data.deployment.$id)}>Download</Button>
                {/if}

                {#if data.func.deploymentId !== data.deployment.$id && data.deployment.status === 'ready'}
                    <Button
                        disabled={data.activeDeployment}
                        on:click={() => {
                            showActivate = true;
                        }}>Activate</Button>
                {/if}
            </Layout.Stack>
        </svelte:fragment>
    </DeploymentCard>

    <Card.Base padding="s">
        <Accordion
            title="Deployment logs"
            badge={capitalize(data.deployment.status)}
            open={data.deployment.status !== 'ready'}
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
                                <p use:timer={{ start: data.deployment.$createdAt }} />
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
<Activate selectedDeployment={data.deployment} bind:showActivate on:activated={handleActivate} />
