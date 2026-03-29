<script lang="ts">
    import { BackupRestoreBox, MigrationBox, UploadBox, CsvExportBox } from '$lib/components';
    import VariablesImportBox from './variablesImportBox.svelte';
    import { realtime } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project, stats } from './store';

    import { goto } from '$app/navigation';
    import { disableCommands, registerCommands, registerSearchers } from '$lib/commandCenter';

    import {
        bucketSearcher,
        dbSearcher,
        functionsSearcher,
        teamSearcher,
        userSearcher
    } from '$lib/commandCenter/searchers';
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import {
        canSeeBuckets,
        canSeeDatabases,
        canSeeFunctions,
        canSeeMessages,
        canWriteProjects,
        canWriteSites
    } from '$lib/stores/roles';
    import CsvImportBox from '$lib/components/csvImportBox.svelte';
    import { isCloud } from '$lib/system';
    import PausedProjectModal from './pausedProjectModal.svelte';
    import type { LayoutData } from './$types';
    import { Button } from '$lib/elements/forms';
    import { currentPlan, organizationList } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import SupportWizard from '$routes/(console)/supportWizard.svelte';
    import BlockedLock from './blocked-lock.svg';
    import { isProjectBlocked as getIsProjectBlocked } from '$lib/helpers/project';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    export let data: LayoutData;
    $: isProjectBlocked = getIsProjectBlocked(data.project);
    $: $disableCommands(isProjectBlocked);
    $: allOrgsHavePremiumSupport =
        isCloud &&
        ($organizationList?.teams ?? []).every(
            (team) => (team as Models.Organization).billingPlanDetails?.premiumSupport === true
        );
    $: hasPremiumSupport = $currentPlan?.premiumSupport ?? allOrgsHavePremiumSupport ?? false;

    function contactSupport() {
        wizard.start(SupportWizard);
    }

    onMount(() => {
        return realtime.forProject(page.params.region, ['project', 'console'], (response) => {
            if (response.events.includes('stats.connections')) {
                for (const [projectId, value] of Object.entries(response.payload)) {
                    stats.add(projectId, [new Date(response.timestamp).toISOString(), value]);
                }
            }
        });
    });

    $: $registerCommands([
        {
            label: 'Go to Auth',
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/auth`);
            },
            keys: ['g', 'a'],
            group: 'navigation'
        },
        {
            label: 'Go to Databases',
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/databases`);
            },
            keys: ['g', 'd'],
            group: 'navigation',
            disabled: !$canSeeDatabases
        },
        {
            label: 'Go to Functions',
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/functions`);
            },
            keys: ['g', 'f'],
            group: 'navigation',
            disabled: !$canSeeFunctions
        },
        {
            label: 'Go to Messaging',
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/messaging`);
            },
            keys: ['g', 'm'],
            disabled: page.url.pathname.endsWith('messaging') || !$canSeeMessages,
            group: 'navigation'
        },
        {
            label: 'Go to Storage',
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/storage`);
            },
            keys: ['g', 's'],
            group: 'navigation',
            disabled: !$canSeeBuckets
        },
        {
            label: 'Go to Settings',
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/settings`);
            },
            keys: ['g', 'e'],
            group: 'navigation',
            disabled: !$canWriteProjects
        },
        {
            label: 'Go to Sites',
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}/sites`);
            },
            keys: ['g', 'i'],
            group: 'navigation',
            disabled: !$canWriteSites
        },
        {
            label: 'Go to Overview',
            callback: () => {
                goto(`${base}/project-${$project.region}-${$project.$id}`);
            },
            keys: ['g', 'o'],
            group: 'navigation'
        }
    ]);

    $registerSearchers(userSearcher, teamSearcher, dbSearcher, functionsSearcher, bucketSearcher);
</script>

<div class="project-layout" class:is-blocked={isProjectBlocked}>
    <div
        class="project-layout__content"
        aria-hidden={isProjectBlocked}
        inert={isProjectBlocked || undefined}>
        <slot />
    </div>

    {#if isProjectBlocked}
        <div class="project-layout__overlay">
            <div class="project-layout__lock">
                <img
                    src={BlockedLock}
                    alt=""
                    aria-hidden="true"
                    class="project-layout__lock-icon" />
            </div>

            <Layout.Stack gap="s" alignItems="center">
                <Layout.Stack gap="xs" alignItems="center">
                    <Typography.Title size="l" align="center">
                        Project is currently blocked
                    </Typography.Title>
                    <Typography.Text align="center">
                        Access to this project is restricted. Contact support if the issue persists.
                    </Typography.Text>
                </Layout.Stack>

                <div class="u-margin-block-start-12">
                    {#if hasPremiumSupport}
                        <Button secondary on:click={contactSupport}>Contact support</Button>
                    {:else}
                        <Button secondary href="mailto:support@appwrite.io">Contact support</Button>
                    {/if}
                </div>
            </Layout.Stack>
        </div>
    {/if}
</div>

{#if isCloud && data.project?.status === 'paused'}
    <PausedProjectModal show={true} projectId={data.project.$id} teamId={data.project.teamId} />
{/if}

<div class="layout-level-progress-bars">
    <UploadBox />
    <MigrationBox />
    <BackupRestoreBox />
    <CsvImportBox />
    <CsvExportBox />
    <VariablesImportBox />
</div>

<style>
    .project-layout {
        position: relative;
        min-height: 100%;
    }

    .project-layout__content {
        min-height: 100%;
    }

    .project-layout.is-blocked .project-layout__content {
        filter: blur(3px);
        opacity: 0.18;
        pointer-events: none;
        user-select: none;
    }

    .project-layout__overlay {
        position: fixed;
        inset: 48px 0 0 0;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 0.5rem;
        padding: 2rem;
        text-align: center;
        pointer-events: auto;
    }

    @media (min-width: 1024px) {
        .project-layout__overlay {
            padding-left: calc(190px + 2rem);
        }
    }

    .project-layout__lock {
        width: 2.75rem;
        height: 2.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--bgcolor-neutral-primary, #ffffff) 96%, transparent);
        border: 1px solid color-mix(in srgb, #fb4f7c 22%, var(--border-neutral, #d7d7db));
        border-radius: 0.875rem;
        box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
    }

    .project-layout__lock-icon {
        width: 30px;
        height: 30px;
        flex-shrink: 0;
        aspect-ratio: 1 / 1;
        display: block;
    }

    .layout-level-progress-bars {
        gap: 1rem;
        z-index: 100;
        display: flex;
        flex-direction: column;

        right: 0;
        bottom: 0;
        position: fixed;
        padding: 1.5rem;
    }

    @media (max-width: 768px) {
        .project-layout__overlay {
            padding: 1.5rem;
        }

        .project-layout__lock {
            width: 3rem;
            height: 3rem;
        }

        .project-layout__lock-icon {
            width: 30px;
            height: 30px;
            flex-shrink: 0;
            aspect-ratio: 1 / 1;
        }

        .layout-level-progress-bars {
            width: 100%;
            align-items: center;
            box-sizing: border-box;
        }

        :global(main:has([data-side-sheet-visible='true']) .layout-level-progress-bars) {
            visibility: hidden;
        }

        :global(body:has(section .wizard) .layout-level-progress-bars) {
            visibility: hidden;
        }
    }
</style>
