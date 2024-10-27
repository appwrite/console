<script lang="ts">
    import { Card, Status } from '$lib/components/index.js';
    import { Pill } from '$lib/elements';
    import { timeFromNow } from '$lib/helpers/date';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import type { Models } from '@appwrite.io/console';
    import { Image, Layout, Typography, Popover, Tooltip } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    export let deployment: Models.Deployment;
    export let site: Models.Site;
    export let proxyRuleList: Models.ProxyRuleList;

    let rule = proxyRuleList.rules[0];

    let deploymentSize;
    let buildSize;
    let totalSize;

    onMount(() => {
        deploymentSize = humanFileSize(deployment.size);
        buildSize = humanFileSize(deployment.buildSize);
        totalSize = humanFileSize(deployment.buildSize + deployment.size);
    });
</script>

<Card padding="s">
    <Layout.Stack direction="row" gap="xl">
        <Image
            alt={site.name}
            src={site?.preview ??
                'https://f002.backblazeb2.com/file/meldiron-public/Desktop+-+2.png'}
            style="width: 445px; height: 280px;" />
        <div>
            <Layout.Stack gap="xl">
                <Layout.Stack direction="row" gap="xl">
                    {#if deployment.status}
                        <div style:width="87px">
                            <Typography.Text color="--color-fgcolor-neutral-tertiary">
                                Status
                            </Typography.Text>
                            <Typography.Text>
                                <Status status={deployment.status}>
                                    {deployment.status}
                                </Status>
                            </Typography.Text>
                        </div>
                    {/if}
                    <div>
                        <Typography.Text color="--color-fgcolor-neutral-tertiary">
                            Updated
                        </Typography.Text>
                        <p>
                            {timeFromNow(deployment.$updatedAt)}
                            {#if deployment.providerCommitAuthor}
                                by <a
                                    class="u-underline u-cursor-pointer"
                                    target="_blank"
                                    href={deployment.providerCommitAuthorUrl}
                                    >{deployment.providerCommitAuthor}</a>
                            {/if}
                        </p>
                    </div>
                </Layout.Stack>
                <Layout.Stack gap="xl">
                    {#if rule?.domain}
                        <a
                            href={`http://${rule.domain}`}
                            target="_blank"
                            class="u-flex u-gap-4 u-cross-center">
                            <span class="link">
                                {rule.domain}
                            </span>
                            <span class="icon-external-link" aria-hidden="true" />
                        </a>
                        {#if proxyRuleList.rules.length > 1}
                            <Popover let:toggle>
                                <Pill button on:click={toggle}>
                                    +{proxyRuleList.rules.length - 1}
                                </Pill>
                                <svelte:fragment slot="list">
                                    {#each proxyRuleList.rules as r, i}
                                        {#if i !== 0}
                                            <a href={`http://${r.domain}`}>
                                                {r.domain}
                                            </a>
                                        {/if}
                                    {/each}
                                </svelte:fragment>
                            </Popover>
                        {/if}
                    {/if}
                    <Layout.Stack direction="row" gap="xl">
                        <div style:width="87px">
                            <Typography.Text color="--color-fgcolor-neutral-tertiary">
                                Build time
                            </Typography.Text>
                            <p>
                                {calculateTime(deployment.buildTime)}
                            </p>
                        </div>
                        <div>
                            <Typography.Text color="--color-fgcolor-neutral-tertiary">
                                Total size
                            </Typography.Text>
                            {totalSize?.value + totalSize?.unit}
                            <Tooltip>
                                <span
                                    class="icon-info"
                                    aria-hidden="true"
                                    style="font-size: var(--icon-size-small)" />
                                <svelte:fragment slot="tooltip">
                                    <p>
                                        <b>Deployment size:</b>
                                        {deploymentSize?.value + deploymentSize?.unit}
                                        <b> Build size:</b>
                                        {buildSize?.value + buildSize?.unit}
                                    </p>
                                </svelte:fragment>
                            </Tooltip>
                        </div>
                    </Layout.Stack>
                </Layout.Stack>
                <div>
                    <Typography.Text color="--color-fgcolor-neutral-tertiary">
                        Source
                    </Typography.Text>
                    {#if deployment.type === 'vcs'}
                        <Popover let:toggle>
                            <button on:click={toggle} type="button">
                                <span class="icon-github" aria-hidden="true" />
                                <span class="link">GitHub</span>
                            </button>
                            <svelte:fragment slot="list">
                                <a href={deployment.providerRepositoryUrl}>
                                    {deployment.providerRepositoryOwner}/{deployment.providerRepositoryName}
                                </a>
                                <a href={deployment.providerBranchUrl}>
                                    {deployment.providerBranch}
                                </a>
                                {#if deployment?.providerCommitMessage && deployment?.providerCommitHash && deployment?.providerCommitUrl}
                                    <a href={deployment.providerCommitUrl}>
                                        {deployment?.providerCommitHash?.substring(0, 7)}
                                        {deployment.providerCommitMessage}
                                    </a>
                                {/if}
                            </svelte:fragment>
                        </Popover>
                    {:else if deployment.type === 'manual'}
                        <span class="icon-code" aria-hidden="true" /> <span>Manual</span>
                    {:else if deployment.type === 'cli'}
                        <span class="icon-terminal" aria-hidden="true" /> <span>CLI</span>
                    {/if}
                </div>
            </Layout.Stack>
        </div>
    </Layout.Stack>
</Card>
