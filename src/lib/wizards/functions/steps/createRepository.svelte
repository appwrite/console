<script lang="ts">
    import { page } from '$app/stores';
    import Button from '$lib/elements/forms/button.svelte';
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputChoice from '$lib/elements/forms/inputChoice.svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import Repositories from '../components/repositories.svelte';
    import { installation, repository, templateConfig } from '../store';

    let selectedInstallationId;
    let hasInstallations;
    let selectedRepository;

    async function beforeSubmit() {
        if (!hasInstallations || !$installation) {
            throw new Error('Please connect a Git provider');
        }

        if ($templateConfig.repositoryBehaviour === 'new') {
            const repo = await sdk.forProject.vcs.createRepository(
                $installation.$id,
                $templateConfig.repositoryName,
                $templateConfig.repositoryPrivate
            );
            $repository = repo;
        }

        if (!$repository) {
            throw new Error('Please select a repository');
        }
    }

    function connectGitHub() {
        const redirect = new URL($page.url);
        redirect.searchParams.append('github-installed', 'true');
        const target = new URL(`${sdk.forProject.client.config.endpoint}/v1/vcs/github/authorize`);
        target.searchParams.set('projectId', $page.params.project);
        target.searchParams.set('redirect', redirect.toString());
        return target;
    }

    async function loadInstallations() {
        const { installations } = await sdk.forProject.vcs.listInstallations();
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
    <svelte:fragment slot="title">Select repository</svelte:fragment>
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
                <div class="u-flex u-gap-16">
                    <div class="u-width-full-line">
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
                    </div>
                </div>
            {:else}
                <div class="u-flex u-cross-center u-flex-vertical u-gap-16">
                    <Button href={connectGitHub().toString()} fullWidth secondary>
                        <span class="icon-github" aria-hidden="true" />
                        <span class="text">Continue with GitHub</span>
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
        {/await}

        {#if $installation}
            <div
                class="box u-margin-block-start-20"
                style:--box-border-radius="var(--border-radius-small)">
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
            </div>
        {/if}
    {/if}
</WizardStep>
