<script lang="ts" module>
    export type { AttachOptions } from './studio-widget';
</script>

<script lang="ts">
    import './shim.css';
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { Dependencies } from '$lib/constants';
    import { goto, invalidate } from '$app/navigation';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { ensureStudioComponent, initImagine, getWebComponents } from './studio-widget';
    import SideSheet from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/layout/sidesheet.svelte';

    const {
        region,
        projectId
    }: {
        region: string;
        projectId: string;
    } = $props();

    let showManageDomainsSheet = $state(false);

    onMount(() => {
        ensureStudioComponent();

        initImagine(region, projectId, {
            onProjectNameChange: () => {
                invalidate(Dependencies.PROJECT);
            },
            onAddDomain: async () => {
                await goto(
                    resolve(
                        '/(console)/project-[region]-[project]/sites/site-[site]/domains/add-domain?types=false',
                        {
                            region,
                            project: projectId,
                            site: `project-${projectId}`
                        }
                    )
                );
            },
            onManageDomains: () => {
                showManageDomainsSheet = true;
            }
        });

        return app.subscribe(async ($app) => {
            try {
                const { changeTheme } = await getWebComponents();
                if (changeTheme) {
                    changeTheme($app.themeInUse);
                }
            } catch (error) {
                console.error('Failed to change theme:', error);
            }
        });
    });
</script>

<div aria-hidden="true" style:display="none"></div>

<SideSheet title="Domains" bind:show={showManageDomainsSheet}>
    <Layout.Stack gap="xxs">
        <Typography.Text color="--fgcolor-neutral-tertiary">Primary domain</Typography.Text>

        <Typography.Text color="--fgcolor-neutral-tertiary"></Typography.Text>
    </Layout.Stack>
</SideSheet>
