<script lang="ts">
    import { page } from '$app/state';
    import { Id, RegionEndpoint } from '$lib/components';
    import { Cover } from '$lib/layout';
    import { project } from '../store';
    import { hasOnboardingDismissed, setHasOnboardingDismissed } from '$lib/helpers/onboarding';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Layout, Button, Typography } from '@appwrite.io/pink-svelte';
    import { user } from '$lib/stores/user';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
</script>

{#if !page.url.pathname.includes('get-started')}
    <Cover>
        <svelte:fragment slot="header">
            <Typography.Title color="--fgcolor-neutral-primary" size="xl">
                {$project?.name}
            </Typography.Title>
            <Layout.Stack alignItems="center">
                <Id value={$project.$id}>{$project.$id}</Id>
                <RegionEndpoint />
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
                    {#if !hasOnboardingDismissed($project.$id)}
                        <Button.Button
                            variant="secondary"
                            size="s"
                            on:click={async () => {
                                trackEvent('onboarding_hub_platform_dismiss');
                                await setHasOnboardingDismissed($project.$id);
                                await invalidate(Dependencies.ORGANIZATION);
                                goto(`${base}/project-${$project.region}-${$project.$id}/overview`);
                            }}>Dismiss this page</Button.Button>
                    {/if}
                </div>
            </Layout.Stack>
        </svelte:fragment>
    </Cover>
{/if}
