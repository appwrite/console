<script lang="ts">
    import { CustomId } from '$lib/components';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { Fieldset, Icon, Layout, Tag } from '@appwrite.io/pink-svelte';
    import type { ComponentType } from 'svelte';

    export let name: string;
    export let id: string;
    export let showFramework = false;
    export let framework: Models.TemplateFramework | undefined = undefined;
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
                <CustomId bind:id bind:show={showCustomId} name="Site" />
            {:else}
                <div>
                    <Tag size="s" on:click={() => (showCustomId = !showCustomId)}>
                        <Icon icon={IconPencil} size="s" />
                        Site ID
                    </Tag>
                </div>
            {/if}
        </Layout.Stack>
        {#if showFramework}
            <InputSelect
                id="framework"
                label="Framework"
                placeholder="Select framework"
                bind:value={framework.name}
                {options} />
        {/if}
    </Layout.Stack>
</Fieldset>
