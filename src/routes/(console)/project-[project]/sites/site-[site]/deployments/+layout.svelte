<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate, goto } from '$app/navigation';
    import { registerCommands } from '$lib/commandCenter';
    import { project } from '../../../store';
    import type { Models } from '@appwrite.io/console';
    import { base } from '$app/paths';
    import { canWriteSites } from '$lib/stores/roles';
    import { IconList, IconPlus, IconSearch } from '@appwrite.io/pink-icons-svelte';

    onMount(() => {
        let previousStatus = null;
        return sdk.forConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (previousStatus === message.payload.status) {
                return;
            }
            previousStatus = message.payload.status;
            if (message.events.includes('sites.*.deployments.*.create')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
            if (message.events.includes('sites.*.deployments.*.update')) {
                invalidate(Dependencies.DEPLOYMENTS);
                invalidate(Dependencies.SITE);
                console.log(message);
                return;
            }
            if (message.events.includes('sites.*.deployments.*.delete')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
        });
    });

    $: $registerCommands([
        {
            label: 'Create deployment',
            async callback() {
                if (!page.url.pathname.endsWith(page.params.site)) {
                    await goto(`${base}/project-${$project.$id}/sites/site-${page.params.site}`);
                }
            },
            keys: page.url.pathname.endsWith(page.params.site) ? ['c'] : ['c', 'd'],
            group: 'sites',
            icon: IconPlus,
            disabled: !$canWriteSites
        },
        {
            label: 'Permissions',
            async callback() {
                await goto(
                    `${base}/project-${$project.$id}/sites/site-${page.params.site}/settings#permissions`
                );
                scrollBy({ top: -100 });
            },
            icon: IconSearch,
            group: 'sites',
            disabled: !$canWriteSites
        },

        {
            label: 'Variables',
            async callback() {
                await goto(
                    `${base}/project-${$project.$id}/sites/site-${page.params.site}/settings#variables`
                );
            },
            icon: IconList,
            group: 'sites',
            disabled: !$canWriteSites
        },
        {
            label: 'Go to deployments',
            callback() {
                goto(`${base}/project-${$project.$id}/sites/site-${page.params.site}/deployments`);
            },
            keys: ['g', 'd'],
            group: 'navigation',
            rank: 10,
            disabled: page.url.pathname.endsWith('deployments')
        },
        {
            label: 'Go to usage',
            callback() {
                goto(`${base}/project-${$project.$id}/sites/site-${page.params.site}/usage`);
            },
            keys: ['g', 'u'],
            group: 'navigation',
            rank: 10,
            disabled: page.url.pathname.endsWith('usage')
        },
        {
            label: 'Go to logs',
            callback() {
                goto(`${base}/project-${$project.$id}/sites/site-${page.params.site}/logs`);
            },
            keys: ['g', 'e'],
            group: 'navigation',
            rank: 10,
            disabled: page.url.pathname.endsWith('logs')
        },
        {
            label: 'Go to settings',
            callback() {
                goto(`${base}/project-${$project.$id}/sites/site-${page.params.site}/settings`);
            },
            keys: ['g', 's'],
            group: 'navigation',
            rank: 10,
            disabled: page.url.pathname.endsWith('settings') || !$canWriteSites
        }
    ]);
</script>

<slot />
