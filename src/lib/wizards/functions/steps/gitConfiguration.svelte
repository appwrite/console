<script lang="ts">
    import { FormList, InputChoice, InputSelect, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { choices, installation, repository } from '../store';

    $choices.rootDir ??= './';
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
        $choices.branch = sorted[0].name ?? null;

        return sorted;
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Execute access</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose who can execute this function using the client API. For more information, check out
        the <a
            href="https://appwrite.io/docs/permissions"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            Permissions Guide
        </a>.
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
                    <InputSelect
                        id="branch"
                        label="Branch"
                        options={branches?.map((branch) => {
                            return {
                                value: branch.name,
                                label: branch.name
                            };
                        }) ?? []}
                        bind:value={$choices.branch} />
                    <InputText id="root" label="Root directory" bind:value={$choices.rootDir} />
                    <InputChoice
                        id="silent"
                        label="Silent mode"
                        tooltip="Don't create comments when pushing to this repository"
                        bind:value={$choices.silentMode} />
                </FormList>
            </div>
        {/await}
    </div>
</WizardStep>
