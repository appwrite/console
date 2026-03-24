<script lang="ts">
    import { BackupRestoreBox, MigrationBox, UploadBox, CsvExportBox } from '$lib/components';
    import { realtime } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project, stats } from './store';

    import { goto } from '$app/navigation';
    import { registerCommands, registerSearchers } from '$lib/commandCenter';

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
    import { wizard } from '$lib/stores/wizard';
    import SupportWizard from '$routes/(console)/supportWizard.svelte';
    import BlockedLock from './blocked-lock.svg';

    export let data: LayoutData;
    $: isProjectBlocked = data.project?.status !== 'paused' && !!data.project?.blocks?.length;

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
    <div class="project-layout__content" aria-hidden={isProjectBlocked}>
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

            <div class="project-layout__dialog">
                <h2>Project is currently blocked</h2>
                <p>Access to this project is restricted. Contact support if the issue persists.</p>

                <Button secondary on:click={contactSupport}>Contact support</Button>
            </div>
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
</div>

<style>
    .project-layout {
        position: relative;
        min-height: 100%;
    }

    .project-layout.is-blocked {
        display: flex;
        flex: 1;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }

    .project-layout__content {
        min-height: 100%;
    }

    .project-layout.is-blocked .project-layout__content {
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }

    .project-layout.is-blocked .project-layout__content {
        filter: blur(3px);
        opacity: 0.18;
        pointer-events: none;
        user-select: none;
    }

    .project-layout__overlay {
        position: absolute;
        inset: 0;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
        text-align: center;
    }

    .project-layout__lock {
        width: 3.5rem;
        height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--bgcolor-neutral-primary, #ffffff) 92%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-neutral, #d7d7db) 70%, transparent);
        border-radius: 1rem;
        box-shadow: 0 12px 32px rgba(17, 24, 39, 0.08);
    }

    .project-layout__lock-icon {
        width: 30px;
        height: 30px;
        flex-shrink: 0;
        aspect-ratio: 1 / 1;
        display: block;
    }

    .project-layout__dialog {
        max-width: 30rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .project-layout__dialog h2 {
        margin: 0;
        color: var(--fgcolor-neutral-primary, #2d2d31);
        font-size: 2rem;
        line-height: 1.05;
        letter-spacing: -0.02em;
        font-weight: 500;
    }

    .project-layout__dialog p {
        margin: 0;
        max-width: 24rem;
        color: var(--fgcolor-neutral-secondary, #56565c);
        font-size: 1rem;
        line-height: 1.4;
    }

    :global(.project-layout__dialog .button) {
        min-width: 10rem;
        min-height: 2.75rem;
        padding-inline: 1rem;
        border-radius: 0.9rem;
        background: color-mix(in srgb, var(--bgcolor-neutral-primary, #ffffff) 92%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-neutral, #d7d7db) 75%, transparent);
        box-shadow: 0 2px 8px rgba(17, 24, 39, 0.04);
    }

    :global(.project-layout__dialog .button .text) {
        color: var(--fgcolor-neutral-secondary, #56565c);
        font-size: 1rem;
        font-weight: 500;
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

        .project-layout__dialog h2 {
            font-size: 1.5rem;
        }

        .project-layout__dialog p {
            font-size: 0.95rem;
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
    }
</style>
