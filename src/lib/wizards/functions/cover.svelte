<script lang="ts">
    import { base } from '$app/paths';
    import { Heading } from '$lib/components';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import WizardCover from '$lib/layout/wizardCover.svelte';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import type { Models } from '@appwrite.io/console';
    import Repositories from './components/repositories.svelte';
    import CreateManual from './createManual.svelte';
    import { repository } from './store';
    import CreateGit from './createGit.svelte';

    let hasInstallations;
    let selectedRepository;

    const quickStarts: {
        name: string;
        icon: string;
    }[] = [
        {
            icon: 'dart',
            name: 'Dart'
        },
        {
            icon: 'node',
            name: 'Node.js'
        },
        {
            icon: 'php',
            name: 'PHP'
        },
        {
            icon: 'python',
            name: 'Python'
        },
        {
            icon: 'swift',
            name: 'Swift'
        },
        {
            icon: 'ruby',
            name: 'Ruby'
        }
    ];

    const templates: {
        name: string;
        description: string;
        icon: string;
    }[] = [
        {
            name: 'URL shortener',
            description: 'Shorten URLs using Bitly',
            icon: 'python'
        },
        {
            name: 'URL shortener',
            description: 'Shorten URLs using Bitly',
            icon: 'dart'
        },
        {
            name: 'URL shortener',
            description: 'Shorten URLs using Bitly',
            icon: 'node'
        }
    ];

    function connect(event: CustomEvent<Models.Repository>) {
        repository.set(event.detail);
        wizard.start(CreateGit);
    }
</script>

<WizardCover>
    <svelte:fragment slot="title">Create function</svelte:fragment>
    <div class="wizard-container container">
        <div class="u-text-center">
            <Heading size="5" tag="h1">Choose your source</Heading>
            <p class="u-margin-block-start-8">
                Connect your function to a Git repository or use a template to get started. You can
                also create a function <span
                    class="link"
                    on:keyup={clickOnEnter}
                    on:click={() => wizard.start(CreateManual)}>manually</span
                >.
            </p>
        </div>
        <div class="grid-1-1 u-gap-24 u-margin-block-start-48">
            <div class="card u-cross-child-start">
                <Heading size="6" tag="h2">Import Git repository</Heading>
                <p class="u-margin-block-start-8">
                    Create and deploy a function with a connected git repository.
                </p>
                <div class="u-margin-block-start-24" />
                <Repositories
                    bind:hasInstallations
                    bind:selectedRepository
                    action="button"
                    on:connect={connect} />
            </div>
            <div class="card">
                <section class="common-section">
                    <h2 class="heading-level-6">Quick start</h2>
                    <p class="u-margin-block-start-8">
                        Use a starter templates to begin with the basics.
                    </p>
                    <ul
                        class="grid-box u-margin-block-start-16"
                        style:--grid-gap="1rem"
                        style:--p-grid-item-size="8rem">
                        {#each quickStarts as quickStart}
                            <li>
                                <button
                                    class="box u-width-full-line u-flex-vertical u-cross-center u-gap-8"
                                    style:--box-padding="1rem"
                                    style:--box-border-radius="var(--border-radius-small)">
                                    <div class="avatar">
                                        <img
                                            style:--p-text-size="1.25rem"
                                            src={`${base}/icons/${$app.themeInUse}/color/${quickStart.icon}.svg`}
                                            alt={quickStart.name} />
                                    </div>
                                    <div class="body-text-2">{quickStart.name}</div>
                                </button>
                            </li>
                        {/each}
                    </ul>
                </section>
                <section class="common-section">
                    <h2 class="heading-level-6">Templates</h2>
                    <p class="u-margin-block-start-8">
                        Choose from a selection of templates to find the right one for your use
                        case.
                    </p>

                    <ul class="u-flex-vertical u-gap-8 u-margin-block-start-16">
                        {#each templates as template}
                            <li>
                                <button
                                    class="box u-width-full-line u-flex u-gap-8"
                                    style:--box-padding="1rem"
                                    style:--box-border-radius="var(--border-radius-small)">
                                    <div class="avatar is-size-small" style:--p-text-size="1.25rem">
                                        <img
                                            src={`${base}/icons/${$app.themeInUse}/color/${template.icon}.svg`}
                                            alt={template.name} />
                                    </div>
                                    <div>
                                        <div class="body-text-2 u-trim">{template.name}</div>
                                        <div class="u-trim u-color-text-gray">
                                            {template.description}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        {/each}
                    </ul>
                </section>
            </div>
        </div>
    </div>
</WizardCover>
