<script lang="ts">
    import { Button, InputChoice, InputSelect, InputText } from '$lib/elements/forms';
    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';
    import SelectRootModal from '../(components)/selectRootModal.svelte';

    export let branch: string;
    export let rootDir: string;
    export let options: { value: string; label: string }[] = [];
    export let silentMode: boolean;

    let show = false;
</script>

<Fieldset legend="Branch">
    <Layout.Stack gap="l">
        <InputSelect
            required
            id="branch"
            label="Production branch"
            placeholder="Select branch"
            isSearchable
            bind:value={branch}
            on:select={(event) => {
                branch = event.detail.value;
            }}
            {options} />
        <Layout.Stack direction="row" gap="s" alignItems="flex-end">
            <InputText
                id="root"
                label="Root directory"
                placeholder="Select directory"
                bind:value={rootDir} />
            <Button secondary size="s" on:click={() => (show = true)}>Select</Button>
        </Layout.Stack>
        <InputChoice id="silentMode" label="Silent mode" bind:value={silentMode} />
    </Layout.Stack>
</Fieldset>

{#if show}
    <SelectRootModal bind:show bind:rootDir />
{/if}
