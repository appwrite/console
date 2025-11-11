<script lang="ts" module>
    export type { AttachOptions } from './studio-widget';
</script>

<script lang="ts">
    import './shim.css';
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import { Link } from '$lib/elements';
    import { app } from '$lib/stores/app';
    import { Dependencies } from '$lib/constants';
    import { goto, invalidate } from '$app/navigation';
    import { IconExternalLink } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
    import { ensureStudioComponent, initImagine, getWebComponents } from './studio-widget';
    import DomainsTable from './domainsTable.svelte';
    import SideSheet from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/layout/sidesheet.svelte';

    const {
        region,
        projectId
    }: {
        region: string;
        projectId: string;
    } = $props();

    const siteId = `project-${projectId}`;
    let showManageDomainsSheet = $state(false);
    let primaryDomainForSite = $state(`imagine-${projectId}.stage.appwrite.network`);

    const addDomainUrl = $derived.by(() => {
        const baseUrl = resolve(
            '/(console)/project-[region]-[project]/sites/site-[site]/domains/add-domain',
            {
                region,
                project: projectId,
                site: siteId
            }
        );
        return `${baseUrl}?types=false`;
    });

    onMount(() => {
        ensureStudioComponent();

        initImagine(region, projectId, {
            onProjectNameChange: () => {
                invalidate(Dependencies.PROJECT);
            },
            onAddDomain: async () => {
                await goto(addDomainUrl);
            },
            onManageDomains: (primaryDomain) => {
                if (primaryDomain) {
                    primaryDomainForSite = primaryDomain;
                }
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
    <Layout.Stack gap="xl">
        <Layout.Stack gap="xxs">
            <Typography.Text color="--fgcolor-neutral-tertiary">Active domain</Typography.Text>

            <Typography.Text>
                <Link size="m" external variant="quiet" href={primaryDomainForSite}>
                    <Layout.Stack
                        direction="row"
                        gap="xxs"
                        alignItems="center"
                        alignContent="center">
                        {primaryDomainForSite}

                        <Icon size="s" icon={IconExternalLink} />
                    </Layout.Stack>
                </Link>
            </Typography.Text>
        </Layout.Stack>

        <DomainsTable {siteId} {region} {projectId} />
    </Layout.Stack>
</SideSheet>
