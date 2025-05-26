<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Wizard } from '$lib/layout';
    import { Layout, Typography, Icon, Lights, Step, Card } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import Check from './(components)/check.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import OpenOnMobileModal from '../../(components)/openOnMobileModal.svelte';
    import SiteCard from '../../(components)/siteCard.svelte';
    import { onMount } from 'svelte';
    import AddCollaboratorModal from '../../(components)/addCollaboratorModal.svelte';
    import { protocol } from '$routes/(console)/store';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { sdk } from '$lib/stores/sdk';
    import type { Adapter, BuildRuntime, Framework } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { ConnectRepoModal } from '$lib/components/git';

    export let data;

    let showConnectRepositry = false;
    let showOpenOnMobile = false;
    let showInviteCollaborator = false;

    const siteURL = data.proxyRuleList.rules[0].domain;

    onMount(() => {
        if (
            page.url.searchParams.has('connectRepo') &&
            page.url.searchParams.get('connectRepo') === 'true'
        ) {
            showConnectRepositry = true;
        }
    });

    async function connect(selectedInstallationId: string, selectedRepository: string) {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .sites.update(
                    data.site.$id,
                    data.site.name,
                    data.site.framework as Framework,
                    data.site.enabled,
                    data.site.logging || undefined,
                    data.site.timeout,
                    data.site.installCommand,
                    data.site.buildCommand,
                    data.site.outputDirectory,
                    data.site.buildRuntime as BuildRuntime,
                    data.site.adapter as Adapter,
                    data.site.fallbackFile,
                    selectedInstallationId,
                    selectedRepository,
                    'main',
                    undefined,
                    undefined,
                    undefined
                );
            invalidate(Dependencies.SITE);
        } catch {
            return;
        }
    }
</script>

<Wizard
    column
    href={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${data.site.$id}`}>
    <!-- Creating a new stack -->
    <Layout.Stack gap="xxxl">
        <div style:position="relative" style="z-index: 6;">
            <Layout.Stack gap="xxxl">
                <Layout.Stack gap="l" direction="column" alignItems="center">
                    <Check />
                    <Layout.Stack gap="xs" direction="column" alignItems="center">
                        <Typography.Title size="l">Congratulations!</Typography.Title>
                        <Typography.Text variant="l-400">
                            You deployed your Site successfully
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
                <Lights style="top: -100px; height:200px; width: 50%" />
                <SiteCard
                    variant="secondary"
                    deployment={data.deployment}
                    proxyRuleList={data.proxyRuleList}
                    hideQRCode>
                    <svelte:fragment slot="footer">
                        <Button href={`${$protocol}${siteURL}`} external>Visit site</Button>
                    </svelte:fragment>
                </SiteCard>
            </Layout.Stack>
        </div>

        <!-- To add spacing -->
        <div></div>

        <Step.List>
            <Step.Item state="current" shortLine={true} badgeText="Next steps">
                <Layout.Stack>
                    <Layout.Grid columns={!data.site.providerRepositoryId ? 4 : 3} columnsS={1}>
                        {#if !data.site.providerRepositoryId}
                            <Card.Button
                                radius="s"
                                padding="s"
                                on:click={() => (showConnectRepositry = true)}>
                                <Layout.Stack gap="s" style="height: 100%">
                                    <Layout.Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center">
                                        <Typography.Title size="s">Add repository</Typography.Title>
                                        <Icon
                                            icon={IconArrowSmRight}
                                            size="l"
                                            color="--fgcolor-neutral-weak" />
                                    </Layout.Stack>
                                    <Typography.Text variant="m-400">
                                        Connect to a new repository or an existing one.
                                    </Typography.Text>
                                </Layout.Stack>
                            </Card.Button>
                        {/if}
                        <Card.Link
                            radius="s"
                            padding="s"
                            on:click={() => {
                                trackEvent(Click.DomainCreateClick, {
                                    source: 'sites_create_finish'
                                });
                            }}
                            href={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${data.site.$id}/domains`}>
                            <Layout.Stack gap="s" style="height: 100%">
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <Typography.Title size="s">Add domain</Typography.Title>
                                    <Icon
                                        icon={IconArrowSmRight}
                                        size="l"
                                        color="--fgcolor-neutral-weak" />
                                </Layout.Stack>
                                <Typography.Text variant="m-400">
                                    Connect to an existing domain or add a new one.
                                </Typography.Text>
                            </Layout.Stack>
                        </Card.Link>
                        <Card.Button
                            radius="s"
                            padding="s"
                            on:click={() => (showInviteCollaborator = true)}>
                            <Layout.Stack gap="s" style="height: 100%">
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <Typography.Title size="s">Share site</Typography.Title>
                                    <Icon
                                        icon={IconArrowSmRight}
                                        size="l"
                                        color="--fgcolor-neutral-weak" />
                                </Layout.Stack>
                                <Typography.Text variant="m-400">
                                    Share your progress and start collaborating with your team.
                                </Typography.Text>
                            </Layout.Stack>
                        </Card.Button>
                        <Card.Button
                            radius="s"
                            padding="s"
                            on:click={() => (showOpenOnMobile = true)}>
                            <Layout.Stack gap="s" style="height: 100%">
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <Typography.Title size="s">Open on mobile</Typography.Title>
                                    <Icon
                                        icon={IconArrowSmRight}
                                        size="l"
                                        color="--fgcolor-neutral-weak" />
                                </Layout.Stack>
                                <Typography.Text variant="m-400">
                                    Open the preview of your site on any mobile or tablet device.
                                </Typography.Text>
                            </Layout.Stack>
                        </Card.Button>
                    </Layout.Grid>
                </Layout.Stack>
            </Step.Item>
        </Step.List>
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button
            size="s"
            fullWidthMobile
            secondary
            href={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${data.site.$id}`}>
            Go to dashboard
        </Button>
    </svelte:fragment>
</Wizard>

{#if showConnectRepositry}
    <ConnectRepoModal
        bind:show={showConnectRepositry}
        {connect}
        product="sites"
        callbackState={{ connectRepo: 'true' }} />
{/if}

{#if showOpenOnMobile}
    <OpenOnMobileModal bind:show={showOpenOnMobile} proxyRuleList={data.proxyRuleList} />
{/if}

{#if showInviteCollaborator}
    <AddCollaboratorModal bind:show={showInviteCollaborator} />
{/if}
