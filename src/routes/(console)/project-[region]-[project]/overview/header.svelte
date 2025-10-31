<script lang="ts">
    import { page } from '$app/state';
    import { Id, RegionEndpoint } from '$lib/components';
    import { Cover } from '$lib/layout';
    import { projectRegion } from '../store';
    import { hasOnboardingDismissed, setHasOnboardingDismissed } from '$lib/helpers/onboarding';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { Layout, Button, Typography } from '@appwrite.io/pink-svelte';
    import { user } from '$lib/stores/user';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { trackEvent } from '$lib/actions/analytics';

    function dismissOnboarding() {
        setHasOnboardingDismissed(page.data.project.$id, $user);
        trackEvent('onboarding_hub_platform_dismiss');
        goto(
            resolve('/(console)/project-[region]-[project]/overview/platforms', {
                region: page.data.project.region,
                project: page.data.project.$id
            })
        );
    }
</script>

{#if !page.url.pathname.includes('get-started')}
    <Cover>
        <svelte:fragment slot="header">
            <Layout.Stack alignItems="baseline" direction={$isSmallViewport ? 'column' : 'row'}>
                <Typography.Title color="--fgcolor-neutral-primary" size="xl" truncate>
                    <span class="project-title">
                        {page.data.project?.name}
                    </span>
                </Typography.Title>
                <Layout.Stack direction="row" inline>
                    <Id value={page.data.project.$id} copyText="Copy project ID"
                        >{page.data.project.$id}</Id>
                    {#if $projectRegion}
                        <RegionEndpoint region={$projectRegion} />
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </svelte:fragment>
    </Cover>
{:else}
    <Cover blocksize={$isSmallViewport ? 'auto' : '152px'}>
        <svelte:fragment slot="header">
            <Layout.Stack
                direction={$isSmallViewport ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={$isSmallViewport ? 'flex-start' : 'center'}
                gap="xl">
                <Layout.Stack direction="column" gap={$isSmallViewport ? 's' : 'xs'}>
                    <Typography.Title color="--fgcolor-neutral-primary" size="xl"
                        >{#if $user.name === $user.email}
                            Welcome to Appwrite
                        {:else}
                            Welcome, {$user.name}
                        {/if}</Typography.Title>
                    <Typography.Text size="m" color="--fgcolor-neutral-secondary"
                        >Follow a few quick steps to get started with Appwrite</Typography.Text>
                </Layout.Stack>
                <div class="dashboard-header-button">
                    {#if !hasOnboardingDismissed(page.data.project.$id, $user)}
                        <Button.Button size="s" variant="secondary" on:click={dismissOnboarding}>
                            Dismiss this page
                        </Button.Button>
                    {/if}
                </div>
            </Layout.Stack>
        </svelte:fragment>
    </Cover>
{/if}

<style>
    .project-title {
        max-width: 375px;
        overflow: hidden;
        display: inline-block;
        vertical-align: middle;
        text-overflow: ellipsis;
    }
</style>
