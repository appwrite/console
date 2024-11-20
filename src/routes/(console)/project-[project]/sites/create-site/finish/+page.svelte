<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Card from '$lib/components/card.svelte';
    import { Wizard } from '$lib/layout';
    import { Layout, Typography, Image, Icon } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import Check from './(components)/check.svelte';
    import { timeFromNow } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import Button from '$lib/elements/forms/button.svelte';
    import Link from '$lib/elements/link.svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import ConnectRepoModal from './(components)/connectRepoModal.svelte';
    import OpenOnMobileModal from './(components)/openOnMobileModal.svelte';

    export let data: PageData;

    let showConnectRepositry = false;
    let showOpenOnMobile = false;
    let showInviteCollaborator = false;
    let showAddDomain = false;

    $: size = humanFileSize(data.deployment.buildSize);
</script>

<Wizard
    title="Create a site"
    hideAside={true}
    href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}>
    <Layout.Stack gap="l">
        <Layout.Stack gap="xxl">
            <Layout.Stack gap="l" direction="column" alignItems="center">
                <Check />
                <Layout.Stack gap="s" direction="column" alignItems="center">
                    <Typography.Text variant="l-400">Congratulations!</Typography.Text>
                    <Typography.Text variant="m-400"
                        >You deployed your Site successfully.</Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
            <Card padding="xs">
                <Layout.Stack gap="m" direction="row">
                    <Image
                        width={445}
                        height={280}
                        src="https://f002.backblazeb2.com/file/meldiron-public/Desktop+-+2.png"
                        alt="Screenshot" />
                    <Layout.Stack justifyContent="center">
                        <Layout.Stack gap="xs">
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary">
                                Deployed
                            </Typography.Text>
                            {#if data.deployment.providerCommitAuthor}
                                <Typography.Text variant="m-400">
                                    {timeFromNow(data.deployment.$updatedAt)} ago by {data
                                        .deployment.providerCommitAuthor}
                                </Typography.Text>
                            {:else}
                                <Typography.Text variant="m-400">
                                    {timeFromNow(data.deployment.$updatedAt)}
                                </Typography.Text>
                            {/if}
                        </Layout.Stack>
                        <Layout.Stack gap="xs">
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary">Domains</Typography.Text>
                            <Link href="https://{data.rule.domain}">{data.rule.domain}</Link>
                        </Layout.Stack>
                        <Layout.Stack gap="xl" direction="row">
                            <Layout.Stack gap="xs" inline>
                                <Typography.Text
                                    variant="m-400"
                                    color="--color-fgcolor-neutral-tertiary"
                                    >Build time</Typography.Text>
                                <Typography.Text variant="m-400"
                                    >{calculateTime(data.deployment.buildTime)}</Typography.Text>
                            </Layout.Stack>
                            <Layout.Stack gap="xs" inline>
                                <Typography.Text
                                    variant="m-400"
                                    color="--color-fgcolor-neutral-tertiary"
                                    >Total size</Typography.Text>
                                <Typography.Text variant="m-400"
                                    >{size.value}{size.unit}</Typography.Text>
                            </Layout.Stack>
                        </Layout.Stack>
                        {#if data.deployment.providerCommitHash}
                            <Layout.Stack gap="xs">
                                <Typography.Text
                                    variant="m-400"
                                    color="--color-fgcolor-neutral-tertiary"
                                    >Source</Typography.Text>
                                <Typography.Text variant="m-400"
                                    >{data.deployment.providerBranch} branch</Typography.Text>
                                <Typography.Text variant="m-400"
                                    >{data.deployment.providerCommitHash} initial commit</Typography.Text>
                            </Layout.Stack>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Card>
        </Layout.Stack>

        {#if !data.deployment.providerCommitHash}
            <Layout.Stack direction="row">
                {#if !data.site.installationId}
                    <Card isTile radius="s" isButton on:click={() => (showConnectRepositry = true)}>
                        <Layout.Stack gap="s">
                            <Layout.Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center">
                                <Typography.Title size="s">Connect to repository</Typography.Title>
                                <Icon icon={IconArrowSmRight} />
                            </Layout.Stack>
                            <Typography.Text variant="m-400">
                                Connect to a new repository or an existing one.
                            </Typography.Text>
                        </Layout.Stack>
                    </Card>
                {/if}
                <Card isTile radius="s" isButton on:click={() => (showAddDomain = true)}>
                    <Layout.Stack gap="s">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography.Title size="s">Add domain</Typography.Title>
                            <Icon icon={IconArrowSmRight} />
                        </Layout.Stack>
                        <Typography.Text variant="m-400">
                            Connect to an existing domain or purchase a new one.
                        </Typography.Text>
                    </Layout.Stack>
                </Card>
                <Card isTile radius="s" isButton on:click={() => (showInviteCollaborator = true)}>
                    <Layout.Stack gap="s">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography.Title size="s">Add collaborators</Typography.Title>
                            <Icon icon={IconArrowSmRight} />
                        </Layout.Stack>
                        <Typography.Text variant="m-400">
                            Share your progress and start collaborating with your team.
                        </Typography.Text>
                    </Layout.Stack>
                </Card>
                <Card isTile radius="s" isButton on:click={() => (showOpenOnMobile = true)}>
                    <Layout.Stack gap="s">
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <Typography.Title size="s">Open on mobile</Typography.Title>
                            <Icon icon={IconArrowSmRight} />
                        </Layout.Stack>
                        <Typography.Text variant="m-400">
                            Open the preview of your site on any mobile or tablet device.
                        </Typography.Text>
                    </Layout.Stack>
                </Card>
            </Layout.Stack>
        {/if}
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button
            size="s"
            fullWidthMobile
            href={`${base}/project-${$page.params.project}/sites/site-${data.site.$id}`}>
            Close
        </Button>
    </svelte:fragment>
</Wizard>

{#if showConnectRepositry}
    <ConnectRepoModal bind:show={showConnectRepositry} site={data.site} />
{/if}
{#if showOpenOnMobile}
    <OpenOnMobileModal bind:show={showOpenOnMobile} siteURL={data.deployment.domain} />
{/if}
