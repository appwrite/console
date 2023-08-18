<script lang="ts">
    import { FormList, InputChoice, InputText } from '$lib/elements/forms';
    import InputSelectSearch from '$lib/elements/forms/inputSelectSearch.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { choices, installation, repository } from '../store';

    $choices.rootDir ??= '';
    function getProviderIcon(provider: string) {
        switch (provider) {
            case 'github':
                return 'icon-github';
            default:
                return '';
        }
    }

    async function loadBranches() {
        const { branches } = await sdk.forProject.vcs.listRepositoryBranches(
            $installation.$id,
            $repository.id
        );
        const sorted = branches.sort((a, b) => {
            if (a.name === 'main' || a.name === 'master') {
                return -1;
            }

            return a.name > b.name ? -1 : 1;
        });
        $choices.branch = sorted[0]?.name ?? null;

        if (!$choices.branch) {
            $choices.branch = 'main';
        }

        return sorted;
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Git configuration</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Configure the Git repository that will trigger your function deployments when updated.
    </svelte:fragment>

    <div class="box" style:--box-border-radius="var(--border-radius-small)">
        <div class="u-flex u-gap-16">
            <div class="avatar is-size-x-small">
                <span class={getProviderIcon($repository.provider)} />
            </div>
            <div class="u-cross-child-center u-line-height-1-5">
                <h6 class="u-bold u-trim-1">{$installation.organization}/{$repository.name}</h6>
            </div>
        </div>
        {#await loadBranches()}
            <div class="u-flex u-gap-8 u-cross-center u-main-center">
                <div class="loader u-margin-32" />
            </div>
        {:then branches}
            <div class="u-margin-block-start-24">
                <FormList>
                    <InputSelectSearch
                        required={true}
                        id="branch"
                        label="Production branch"
                        placeholder="Select branch"
                        tooltip="Every commit pushed to this branch will activate the deployment after a successful build"
                        hideRequired
                        bind:value={$choices.branch}
                        bind:search={$choices.branch}
                        on:select={(event) => {
                            $choices.branch = event.detail.value;
                        }}
                        interactiveOutput
                        name="branch"
                        options={branches?.map((branch) => {
                            return {
                                value: branch.name,
                                label: branch.name
                            };
                        }) ?? []} />
                    <InputText
                        id="root"
                        label="Root directory"
                        placeholder="functions/my-function"
                        bind:value={$choices.rootDir} />
                    <InputChoice
                        id="silent"
                        label="Silent mode"
                        tooltip="When enabled, comments will not be made on pull requests in this repository"
                        bind:value={$choices.silentMode} />
                </FormList>
            </div>
        {/await}
    </div>
    <p class="text u-margin-block-start-8">
        View your configuration in <a
            href={$repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            class="link">{$repository.provider}</a
        >.
    </p>
</WizardStep>
