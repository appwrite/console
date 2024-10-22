<!-- <script context="module" lang="ts">
    import CreateTemplate from './wizard/createTemplate.svelte';

    export function connectTemplate(
        template: Models.TemplateFunction,
        runtime: string | null = null
    ) {
        const variables: Record<string, string> = {};
        template.variables.forEach((variable) => {
            variables[variable.name] = variable.value ?? '';
        });

        templateStore.set(template);
        templateConfig.set({
            $id: null,
            runtime,
            name: template.name,
            variables,
            repositoryBehaviour: 'new',
            repositoryName: template.id,
            repositoryPrivate: true,
            repositoryId: null
        });
        wizard.start(CreateTemplate);
    }
</script> -->

<script lang="ts">
    import { base } from '$app/paths';
    import { Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import WizardCover from '$lib/layout/wizardCover.svelte';
    import { isSelfHosted } from '$lib/system';
    import { consoleVariables } from '$routes/(console)/store';
    import { afterNavigate } from '$app/navigation';
    import Card from '$lib/components/card.svelte';
    import Repositories from '$lib/components/repositories.svelte';
    import { repository } from '$lib/stores/vcs';

    export let data;
    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
    let hasInstallations: boolean;
    let selectedRepository: string;

    function connect(event: CustomEvent<Models.ProviderRepository>) {
        trackEvent('click_connect_repository', {
            from: 'cover'
        });
        repository.set(event.detail);
    }

    let previousPage: string = base;
    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<WizardCover bind:previousPage>
    <svelte:fragment slot="title">Create Site</svelte:fragment>
    <div class="wizard-container container">
        <div class="git-container u-position-relative">
            <div class="grid-1-1 u-gap-24">
                <Card style="height: 100%">
                    <Heading size="6" tag="h6">Connect Git repository</Heading>
                    <Repositories
                        bind:hasInstallations
                        bind:selectedRepository
                        action="button"
                        callbackState={{
                            from: 'github',
                            to: 'cover'
                        }}
                        on:connect={connect} />
                    {#if isSelfHosted && !isVcsEnabled}
                        <div
                            class="overlay u-flex-vertical u-position-absolute u-height-100-percent u-width-full-line u-z-index-1 u-text-center u-inset-0"
                            style="border-radius: var(--border-radius-medium)">
                            <div
                                class="u-flex-vertical u-height-100-percent u-main-center u-cross-center u-gap-16 u-padding-inline-24">
                                <Heading size="7" tag="h6" trimmed={false}>
                                    Connect your self-hosted instance to Git
                                </Heading>
                                <p>
                                    Configure your self-hosted instance to connect your function to
                                    a Git repository.
                                    <a
                                        href="https://appwrite.io/docs/advanced/self-hosting/functions#git"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="link">Learn more</a
                                    >.
                                </p>
                            </div>
                        </div>
                    {/if}
                </Card>
                <Card isTile>
                    <Heading size="6" tag="h6">Clone template</Heading>
                    <ul
                        class="grid-box"
                        style:--grid-item-size="8rem"
                        style:--grid-item-size-small-screens="9rem"
                        style:--grid-gap=".5rem">
                        {#each data.siteTemplates.templates.slice(0, 6) as template}
                            <li>
                                <a
                                    on:click={() => {
                                        trackEvent('click_connect_template', {
                                            from: 'cover',
                                            template: template.$id,
                                            runtime: template.name
                                        });
                                    }}
                                    href={`${base}/project-${$page.params.project}/sites/create-site/settings?template=${template.$id}`}
                                    class="box u-width-full-line u-flex u-cross-center u-gap-8"
                                    style:--box-padding="1rem"
                                    style:--box-border-radius="var(--border-radius-small)">
                                    {template.name}
                                </a>
                            </li>
                        {/each}
                    </ul>

                    <Button
                        text
                        class="u-margin-block-start-24 u-margin-inline-start-auto"
                        href="https://appwrite.io">
                        All starter templates <span class="icon-cheveron-right" />
                    </Button>
                </Card>
            </div>
        </div>
    </div>
</WizardCover>

<style lang="scss">
    .git-container .overlay {
        background: linear-gradient(
            0,
            hsl(var(--p-card-bg-color)) 68.91%,
            hsl(var(--p-card-bg-color) / 0.5) 92.8%
        );
    }
</style>
