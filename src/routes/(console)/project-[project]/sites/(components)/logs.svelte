<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { timer } from '$lib/actions/timer';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { app } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { Badge, Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
    import ansicolor from 'ansicolor';
    import { onMount } from 'svelte';

    export let deployment: Models.Deployment;
    export let site: Models.Site;

    let { status, buildLogs } = deployment;

    onMount(() => {
        const unsubscribe = sdk.forConsole.client.subscribe('console', (response) => {
            if (
                response.events.includes(
                    `sites.${deployment.resourceId}.deployments.${deployment.$id}.update`
                )
            ) {
                console.log(response.payload);
                // buildLogs = response.payload.logs;
                // status = response.payload.status;
                const payload = response.payload as Models.Deployment;
                buildLogs = payload.buildLogs;
                status = payload.status;
                if (status === 'ready') {
                    goto(
                        `${base}/project-${$page.params.project}/sites/create-site/finish?site=${site.$id}`
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

    // TODO: Fix the buildLogs to return object, currently its a string.
    function formatLogs(logs: { timestamp: string; content: string }[] = []) {
        let output = '';
        const sum = logs.map((n) => `${n.timestamp} ${n.content}`).join('\n');
        const iterator = ansicolor.parse(sum);
        for (const element of iterator.spans) {
            if (element.color && !element.color.name) output += `<span>${element.text}</span>`;
            else output += `${element.text}`;
        }
        return output;
    }

    async function cancelDeployment() {
        try {
            await sdk.forProject.sites.updateDeploymentBuild(
                deployment.resourceId,
                deployment.$id
            );
            await invalidate(Dependencies.DEPLOYMENTS);
            addNotification({
                type: 'success',
                message: `Deployment has been canceled`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <Typography.Text variant="m-500">Deployment logs</Typography.Text>
            <Badge
                content={status}
                size="xs"
                variant="secondary"
                type={status === 'failed' ? 'error' : undefined} />
        </Layout.Stack>
        <div>
            <Layout.Stack direction="row" alignItems="center">
                {#if ['processing', 'building'].includes(status)}
                    <span use:timer={{ start: deployment.$createdAt }} />
                    <Spinner />
                {:else}
                    {calculateTime(deployment.buildTime)}
                {/if}
            </Layout.Stack>
        </div>
    </Layout.Stack>
    <pre>
        <code>{formatLogs(buildLogs)}</code>
    </pre>
    <!-- <div>
                        <Code lang="text" code={buildLogs.replace(/\\n/g, '\n')} />
                    </div> -->
    <Layout.Stack alignItems="flex-end">
        {#if status !== 'ready'}
            <Button size="xs" text on:click={cancelDeployment}>Cancel deployment</Button>
        {/if}
    </Layout.Stack>
</Layout.Stack>

<style>
    /* TODO: move to pink */
    pre {
        max-height: 600px;
        overflow-y: scroll;
        display: flex;
        flex-direction: column-reverse;
    }
</style>
