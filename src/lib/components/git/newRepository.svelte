<script lang="ts">
    import { InputCheckbox, InputSelect, InputText } from '$lib/elements/forms';
    import { installation } from '$lib/stores/vcs';
    import { supportsPublicRepositories, supportsRepositoryCreation } from '$lib/stores/git';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import type { Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';

    let {
        selectedInstallationId = $bindable(),
        installations,
        repositoryName = $bindable(),
        repositoryPrivate = $bindable(true),
        disableFields = false
    }: {
        selectedInstallationId: string;
        installations: Models.InstallationList;
        repositoryName: string;
        repositoryPrivate?: boolean;
        disableFields?: boolean;
    } = $props();

    // Only offer organizations whose provider can create repositories.
    const creatableInstallations = $derived(
        installations.installations.filter((entry) =>
            supportsRepositoryCreation(entry.provider, $regionalConsoleVariables)
        )
    );

    const supportsPublic = $derived(
        supportsPublicRepositories(
            creatableInstallations.find((entry) => entry.$id === selectedInstallationId)?.provider,
            $regionalConsoleVariables
        )
    );

    $effect(() => {
        if (
            creatableInstallations.length &&
            !creatableInstallations.some((entry) => entry.$id === selectedInstallationId)
        ) {
            selectedInstallationId = creatableInstallations[0].$id;
            $installation = creatableInstallations[0];
        }
    });

    $effect(() => {
        // Without public repository support every repository is private.
        if (!supportsPublic) {
            repositoryPrivate = true;
        }
    });
</script>

<Layout.Stack gap="xl">
    <Layout.Stack gap="l">
        {#key selectedInstallationId}
            <InputSelect
                id="installation"
                label="Git organization"
                disabled={disableFields}
                options={creatableInstallations.map((entry) => {
                    return {
                        label: entry.organization,
                        value: entry.$id
                    };
                })}
                on:change={() => {
                    $installation = creatableInstallations.find(
                        (entry) => entry.$id === selectedInstallationId
                    );
                }}
                bind:value={selectedInstallationId} />
        {/key}
        <InputText
            id="repositoryName"
            label="Repository name"
            placeholder="my-repository"
            disabled={disableFields}
            bind:value={repositoryName} />
    </Layout.Stack>
    {#if supportsPublic}
        <InputCheckbox
            id="repositoryPrivate"
            label="Keep repository private"
            disabled={disableFields}
            bind:checked={repositoryPrivate} />
    {/if}
</Layout.Stack>
