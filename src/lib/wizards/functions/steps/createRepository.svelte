<script lang="ts">
    import { page } from '$app/stores';
    import Button from '$lib/elements/forms/button.svelte';
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { WizardStep } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import Repositories from '../components/repositories.svelte';
    import { installation, repository, template, templateConfig } from '../store';
    import { Box } from '$lib/components';

    let selectedInstallationId: string;
    let hasInstallations: boolean;
    let selectedRepository: string;

    onMount(() => {
        $templateConfig.repositoryPrivate = true;
    });

    async function beforeSubmit() {
        if (!hasInstallations || !$installation) {
            throw new Error('Please connect a Git provider');
        }

        if ($templateConfig.repositoryBehaviour === 'new') {
            const repo = await sdk
                .forProject($page.params.region, $page.params.project)
                .vcs.createRepository(
                    $installation.$id,
                    $templateConfig.repositoryName,
                    $templateConfig.repositoryPrivate
                );
            $repository = repo;

            addNotification({
                type: 'success',
                message: 'Repository successfully created.'
            });
        }

        if (!$repository) {
            throw new Error('Please select a repository');
        }
    }

    function connectGitHub() {
        const redirect = new URL($page.url);
        const callbackState = {
            from: 'github',
            to: 'template',
            step: '5',
            template: $template.id,
            templateConfig: JSON.stringify($templateConfig)
        };

        if (callbackState) {
            Object.keys(callbackState).forEach((key) => {
                redirect.searchParams.append(key, callbackState[key]);
            });
        }
        const target = new URL(
            `${sdk.forProject($page.params.region, $page.params.project).client.config.endpoint}/vcs/github/authorize`
        );
        target.searchParams.set('project', $page.params.project);
        target.searchParams.set('success', redirect.toString());
        target.searchParams.set('failure', redirect.toString());
        target.searchParams.set('mode', 'admin');
        return target;
    }

    async function loadInstallations() {
        const { installations } = await sdk
            .forProject($page.params.region, $page.params.project)
            .vcs.listInstallations();
        if (installations.length) {
            $installation = installations[0];
            hasInstallations = true;
        }

        return installations;
    }

    function getProviderIcon(provider: string) {
        switch (provider) {
            case 'github':
                return 'icon-github';
            default:
                return '';
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Repository</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Select a Git repository that will trigger your function deployments when updated.
    </svelte:fragment>

    {#if $templateConfig.repositoryBehaviour === 'existing'}
        <Repositories bind:hasInstallations bind:selectedRepository />
    {:else}
        {#await loadInstallations()}
            <div class="u-flex u-gap-8 u-cross-center u-main-center">
                <div class="loader u-margin-32" />
            </div>
        {:then installations}
            {#if hasInstallations}
                <FormList>
                    <InputSelect
                        id="installation"
                        label="Git organization"
                        options={installations.map((entry) => {
                            return {
                                label: entry.organization,
                                value: entry.$id
                            };
                        })}
                        on:change={() => {
                            $installation = installations.find(
                                (entry) => entry.$id === selectedInstallationId
                            );
                        }}
                        bind:value={selectedInstallationId} />
                </FormList>
            {:else}
                <div class="u-flex u-cross-center u-flex-vertical u-gap-16">
                    <Button href={connectGitHub().toString()} fullWidth secondary>
                        <span class="icon-github" aria-hidden="true" />
                        <span class="text">GitHub</span>
                    </Button>
                    <Button disabled fullWidth secondary>
                        <span class="icon-gitlab" aria-hidden="true" />
                        <span class="text">GitLab (coming soon)</span>
                    </Button>
                    <Button disabled fullWidth secondary>
                        <span class="icon-bitBucket" aria-hidden="true" />
                        <span class="text">BitBucket (coming soon)</span>
                    </Button>
                    <Button disabled fullWidth secondary>
                        <span class="icon-azure" aria-hidden="true" />
                        <span class="text">Azure (coming soon)</span>
                    </Button>
                </div>
            {/if}
            {#if $installation}
                <Box radius="small" class="u-margin-block-start-20">
                    <div class="u-flex u-gap-16">
                        <div class="avatar is-size-x-small">
                            <span class={getProviderIcon($installation.provider)} />
                        </div>
                        <div class="u-cross-child-center u-line-height-1-5">
                            <h6 class="u-bold u-trim-1">
                                {$installation.organization}/{$templateConfig.repositoryName}
                            </h6>
                        </div>
                    </div>
                    <div class="u-margin-block-start-24">
                        <FormList>
                            <InputText
                                id="repositoryName"
                                label="Repository name"
                                placeholder="my-repository"
                                bind:value={$templateConfig.repositoryName} />
                            <InputChoice
                                id="repositoryPrivate"
                                label="Keep repository private"
                                bind:value={$templateConfig.repositoryPrivate} />
                        </FormList>
                    </div>
                </Box>
            {/if}
        {/await}
    {/if}
</WizardStep>
