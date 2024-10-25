<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputSelect, InputText } from '$lib/elements/forms';

    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';
    export let name: string;
    export let id: string;
    export let showFramework = false;
    export let framework = '';
    export let options: {
        value: string;
        label: string;
    }[] = [];

    let showCustomId = false;
</script>

<Fieldset legend="Details">
    <Layout.Stack gap="l">
        <InputText
            label="Name"
            id="name"
            name="name"
            bind:value={name}
            required
            placeholder="Enter name" />
        {#if showCustomId}
            <CustomId bind:id bind:show={showCustomId} name="Site" fullWidth />
        {:else}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" />
                    <span class="text">Site ID </span>
                </Pill>
            </div>
        {/if}
        {#if showFramework}
            <InputSelect
                id="framework"
                label="Framework"
                placeholder="Select framework"
                bind:value={framework}
                {options} />
        {/if}
    </Layout.Stack>
</Fieldset>
