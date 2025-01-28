<script lang="ts">
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { onboarding, project } from '../store';
    import { hasOnboardingDismissed, setHasOnboardingDismissed } from '$lib/helpers/onboarding';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Layout, Button, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/user';

    let isSmallViewport = false;

    function updateViewport() {
        isSmallViewport = window.matchMedia('(max-width: 768px)').matches;
    }

    onMount(() => {
        updateViewport();
    });
</script>

<svelte:window on:resize={updateViewport} on:load={updateViewport} />
{#if hasOnboardingDismissed($project.$id)}
    <Cover>
        <svelte:fragment slot="header">
            <Typography.Title color="--color-fgcolor-neutral-primary" size="xl">
                {$project?.name}
            </Typography.Title>
            <Id value={$project.$id}>{$project.$id}</Id>
        </svelte:fragment>
    </Cover>
{:else}
    <Cover>
        <svelte:fragment slot="header">
            <Layout.Stack
                direction={isSmallViewport ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={isSmallViewport ? 'flex-start' : 'center'}
                gap="xl">
                <Layout.Stack direction="column" gap={isSmallViewport ? 's' : 'xs'}>
                    <Typography.Title color="--color-fgcolor-neutral-primary" size="xl"
                        >Welcome, {$user.name}</Typography.Title>
                    <Typography.Text size="m" color="--color-fgcolor-neutral-secondary"
                        >Follow a few quick steps to get started with Appwrite</Typography.Text>
                </Layout.Stack>
                <div class="dashboard-header-button">
                    {#if !hasOnboardingDismissed($project.$id)}
                        <Button.Button
                            variant="secondary"
                            size="s"
                            on:click={() => {
                                setHasOnboardingDismissed($project.$id);
                                if (location.href.endsWith('get-started')) {
                                    goto(`${base}/project-${$project.$id}`);
                                } else {
                                    location.reload();
                                }
                            }}>Dismiss this page</Button.Button>
                    {/if}
                </div>
            </Layout.Stack>
        </svelte:fragment>
    </Cover>
{/if}
