<script lang="ts">
    import { InputSelectSearch, InputText } from '$lib/elements/forms';
    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';

    export let branch: string;
    export let rootDir: string;
    export let options: { value: string; label: string }[] = [];
</script>

<Fieldset legend="Production branch">
    <Layout.Stack gap="l">
        <InputSelectSearch
            required={true}
            id="branch"
            label="Production branch"
            placeholder="Select branch"
            tooltip="Every commit pushed to this branch will activate the deployment after a successful build"
            hideRequired
            bind:value={branch}
            bind:search={branch}
            on:select={(event) => {
                branch = event.detail.value;
            }}
            interactiveOutput
            name="branch"
            {options} />
        <InputText
            id="root"
            label="Root directory"
            placeholder="functions/my-function"
            bind:value={rootDir} />
    </Layout.Stack>
</Fieldset>
