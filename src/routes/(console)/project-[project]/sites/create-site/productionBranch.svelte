<script lang="ts">
    import { Button, InputChoice, InputSelectSearch, InputText } from '$lib/elements/forms';
    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';

    export let branch: string;
    export let rootDir: string;
    export let options: { value: string; label: string }[] = [];
    export let silentMode: boolean;
</script>

<Fieldset legend="Branch">
    <Layout.Stack gap="l">
        <InputSelectSearch
            required={true}
            id="branch"
            label="Production branch"
            placeholder="Select branch"
            hideRequired
            bind:value={branch}
            bind:search={branch}
            on:select={(event) => {
                branch = event.detail.value;
            }}
            interactiveOutput
            name="branch"
            {options} />
        <Layout.Stack direction="row" gap="s" alignItems="flex-end">
            <InputText
                id="root"
                label="Root directory"
                placeholder="Select directory"
                bind:value={rootDir} />
            <Button secondary size="s">Select</Button>
        </Layout.Stack>
        <InputChoice id="silentMode" label="Silent mode" bind:value={silentMode} />
    </Layout.Stack>
</Fieldset>
