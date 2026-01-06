<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import Table from '../../overview/(components)/table.svelte';
    import { Button } from '$lib/elements/forms';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { canWriteKeys } from '$lib/stores/roles';

    export let data: PageData;

    const basePath = `${base}/project-${page.params.region}-${page.params.project}/settings`;
</script>

<Container>
    <ResponsiveContainerHeader hideView analyticsSource="settings_api_keys">
        {#if $canWriteKeys}
            <Button href={`${basePath}/api-keys/create`}>
                <Icon icon={IconPlus} size="s" />
                Create API key
            </Button>
        {/if}
    </ResponsiveContainerHeader>
    <Table keys={data.keys} {basePath} />
</Container>
