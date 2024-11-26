<script lang="ts">
    import { InputChoice, InputSelect, InputText } from '$lib/elements/forms';
    import { installation } from '$lib/stores/vcs';
    import type { Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let selectedInstallationId: string;
    export let installations: Models.InstallationList;
    export let repositoryName: string;
    export let repositoryPrivate = true;
</script>

<Layout.Stack gap="l">
    {#key selectedInstallationId}
        <InputSelect
            id="installation"
            label="Git organization"
            options={installations.installations.map((entry) => {
                return {
                    label: entry.organization,
                    value: entry.$id
                };
            })}
            on:change={() => {
                $installation = installations.installations.find(
                    (entry) => entry.$id === selectedInstallationId
                );
            }}
            bind:value={selectedInstallationId} />
    {/key}
    <InputText
        id="repositoryName"
        label="Repository name"
        placeholder="my-repository"
        bind:value={repositoryName} />
    <InputChoice
        id="repositoryPrivate"
        label="Keep repository private"
        bind:value={repositoryPrivate} />
</Layout.Stack>
