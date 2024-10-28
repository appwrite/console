<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import WizardSecondaryContainer from '$lib/layout/wizardSecondaryContainer.svelte';
    import WizardSecondaryContent from '$lib/layout/wizardSecondaryContent.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import ansicolor from 'ansicolor';
    import { Fieldset, Card, Layout, Tag, Typography, Badge } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Aside from '../aside.svelte';
    import { app } from '$lib/stores/app';
    import { goto } from '$app/navigation';

    export let data: PageData;

    let { status, buildLogs } = data.deployment;

    onMount(() => {
        const unsubscribe = sdk.forConsole.client.subscribe('console', (response) => {
            console.log(response);
            if (
                response.events.includes(
                    `sites.${data.deployment.resourceId}.deployments.${data.deployment.$id}.update`
                )
            ) {
                buildLogs = response.payload.logs;
                status = response.payload.status;
                if (status === 'ready') {
                    goto(
                        `${base}/project-${$page.params.project}/sites/create-site/finish?site=${data.site.$id}`
                    );
                }
            }
        });
        return () => unsubscribe();
    });

    ansicolor.rgb =
        $app.themeInUse === 'light'
            ? {
                  black: [0, 0, 0],
                  darkGray: [86, 86, 92],
                  lightGray: [151, 151, 155],
                  white: [0, 0, 0],
                  red: [179, 18, 18],
                  lightRed: [179, 18, 18],
                  green: [10, 113, 79],
                  lightGreen: [10, 113, 79],
                  yellow: [97, 37, 10],
                  lightYellow: [97, 37, 10],
                  blue: [62, 98, 152],
                  lightBlue: [62, 98, 152],
                  magenta: [74, 62, 152],
                  lightMagenta: [74, 62, 152],
                  cyan: [78, 126, 124],
                  lightCyan: [78, 126, 124]
              }
            : {
                  black: [255, 255, 255],
                  darkGray: [129, 129, 134],
                  lightGray: [195, 195, 198],
                  white: [255, 255, 255],
                  red: [255, 69, 58],
                  lightRed: [255, 69, 58],
                  green: [16, 185, 129],
                  lightGreen: [16, 185, 129],
                  yellow: [254, 124, 67],
                  lightYellow: [254, 124, 67],
                  blue: [104, 163, 254],
                  lightBlue: [104, 163, 254],
                  magenta: [203, 194, 255],
                  lightMagenta: [203, 194, 255],
                  cyan: [133, 219, 216],
                  lightCyan: [133, 219, 216]
              };
    function formatLogs(logs: { timestamp: string; content: string }[]) {
        let output = '';
        const sum = logs.map((n) => n.content).join('');
        const iterator = ansicolor.parse(sum);
        for (const element of iterator) {
            if (element.color && !element.color.name) output += `<span>${element.text}</span>`;
            else output += `<span style="${element.css}">${element.text}</span>`;
        }
        return output;
    }
</script>

<WizardSecondaryContainer
    href={`${base}/project-${$page.params.project}/sites/site-${data.deployment.resourceId}`}>
    <WizardSecondaryContent>
        <Layout.Stack gap="xl">
            <Card.Base padding="s">
                <Layout.Stack direction="row">
                    <Layout.Stack direction="row" alignItems="center">
                        <Typography.Text variant="m-500">{data.site.name}</Typography.Text>
                        <Tag size="s">{data.site.$id}</Tag>
                    </Layout.Stack>
                    <span>
                        <Button secondary size="s">Change</Button>
                    </span>
                </Layout.Stack>
            </Card.Base>
            <Fieldset legend="Deploy">
                <Layout.Stack>
                    <Layout.Stack direction="row">
                        <Typography.Text variant="m-500">Deployment logs</Typography.Text>
                        <Badge content={status} size="xs" variant="secondary" />
                    </Layout.Stack>
                    <pre><code>{@html formatLogs(buildLogs)}</code></pre>
                    <!-- <div>
                        <Code lang="text" code={buildLogs.replace(/\\n/g, '\n')} />
                    </div> -->
                    <Layout.Stack alignItems="flex-end">
                        {#if status === 'ready'}
                            <Button
                                href={`${base}/project-${$page.params.project}/sites/create-site/finish?site=${data.site.$id}`}
                                size="xs"
                                text>Finish</Button>
                        {:else}
                            <Button size="xs" text>Cancel deployment</Button>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Fieldset>
        </Layout.Stack>
        <svelte:fragment slot="aside">
            <Aside
                framework={data.frameworks.frameworks.find((f) => f.name === data.site.framework)}
                repositoryName={data.site.providerRepositoryId}
                branch={data.site.providerBranch}
                rootDir={data.site.providerRootDirectory}
                domain={data.deployment.domain} />
        </svelte:fragment>
    </WizardSecondaryContent>
    <svelte:fragment slot="footer">
        <Typography.Text variant="m-400" color="--color-fgColor-neutral-tertiary"
            >Deployment will continue in the background</Typography.Text>
        <Button
            size="s"
            fullWidthMobile
            secondary
            href="{`${base}/project-${$page.params.project}/sites/site-${$page.params.site}`}}"
            >Go to dashboard</Button>
    </svelte:fragment>
</WizardSecondaryContainer>
