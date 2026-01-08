<script lang="ts">
    import { Link } from '$lib/elements';
    import DomainsTable from './table.svelte';
    import { IconExternalLink } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
    import SideSheet from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/layout/sidesheet.svelte';

    let {
        show = $bindable(false),
        domain,
        siteId,
        region,
        projectId,
        onAddNewDomain,
        onDomainsChanged
    }: {
        show: boolean;
        domain: string;
        siteId: string;
        region: string;
        projectId: string;
        onAddNewDomain?: () => void;
        onDomainsChanged?: () => void;
    } = $props();
</script>

<SideSheet title="Domains" bind:show>
    <Layout.Stack gap="xl">
        <Layout.Stack gap="xxs">
            <Typography.Text color="--fgcolor-neutral-tertiary">Active domain</Typography.Text>

            <Typography.Text>
                <Link size="m" external variant="quiet" href={domain}>
                    <Layout.Stack
                        direction="row"
                        gap="xxs"
                        alignItems="center"
                        alignContent="center">
                        {domain}

                        <Icon size="s" icon={IconExternalLink} />
                    </Layout.Stack>
                </Link>
            </Typography.Text>
        </Layout.Stack>

        <DomainsTable {siteId} {region} {projectId} {onAddNewDomain} {onDomainsChanged} />
    </Layout.Stack>
</SideSheet>
