<script lang="ts">
    import { CustomId } from '$lib/components';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { Fieldset, Icon, Layout, Tag } from '@appwrite.io/pink-svelte';
    import type { ComponentType } from 'svelte';

    export let name: string;
    export let id: string;
    export let entrypoint: string;
    export let showEntrypoint = false;
    export let runtime: Partial<Models.TemplateRuntime>;
    export let options: {
        value: string;
        label: string;
        leadingIcon?: ComponentType;
    }[] = [];

    let showCustomId = false;
</script>

<Fieldset legend="Details">
    <Layout.Stack gap="l">
        <Layout.Stack gap="s">
            <InputText
                label="Name"
                id="name"
                name="name"
                bind:value={name}
                required
                placeholder="Enter name" />
            {#if showCustomId}
                <CustomId bind:id bind:show={showCustomId} name="Function" fullWidth />
            {:else}
                <div>
                    <Tag size="s" on:click={() => (showCustomId = !showCustomId)}>
                        <Icon icon={IconPencil} size="s" />
                        Function ID
                    </Tag>
                </div>
            {/if}
        </Layout.Stack>
        <InputSelect
            id="runtime"
            label="Runtime"
            placeholder="Select runtime"
            bind:value={runtime.name}
            required
            {options} />
        {#if showEntrypoint}
            <InputText
                label="Entrypoint"
                id="entrypoint"
                bind:value={entrypoint}
                required
                placeholder="Enter entrypoint" />
        {/if}
    </Layout.Stack>
</Fieldset>
