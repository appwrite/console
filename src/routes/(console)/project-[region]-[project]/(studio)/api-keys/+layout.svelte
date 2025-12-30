<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { Cover, CoverTitle } from '$lib/layout';
    import Button from '$lib/elements/forms/button.svelte';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { canWriteKeys } from '$lib/stores/roles';
    import { resolvedProfile } from '$lib/profiles/index.svelte';
    import { getPageTitle } from '../../store';

    const basePath = `${base}/project-${page.params.region}-${page.params.project}`;
</script>

<svelte:head>
    <title>{getPageTitle(page.data?.project?.name, 'API Keys', resolvedProfile.platform)}</title>
</svelte:head>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>API Keys</CoverTitle>
        {#if $canWriteKeys}
            <Button href={`${basePath}/api-keys/create`}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Create API key
            </Button>
        {/if}
    </svelte:fragment>
</Cover>

<Container>
    <slot />
</Container>
