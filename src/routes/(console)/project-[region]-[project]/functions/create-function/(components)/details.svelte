<script lang="ts">
    import { CustomId } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import Link from '$lib/elements/link.svelte';
    import { upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { Fieldset, Icon, Input, Layout, Tag } from '@appwrite.io/pink-svelte';
    import type { ComponentType } from 'svelte';

    export let name: string;
    export let id: string;
    export let entrypoint: string;
    export let showEntrypoint = false;
    export let runtime: string;
    export let options: {
        value: string;
        label: string;
        leadingIcon?: ComponentType;
    }[] = [];
    export let specification: string;
    export let specificationOptions: {
        value: string;
        label: string;
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
                <CustomId bind:id bind:show={showCustomId} name="Function" />
            {:else}
                <div>
                    <Tag size="s" on:click={() => (showCustomId = !showCustomId)}>
                        <Icon icon={IconPencil} size="s" />
                        Function ID
                    </Tag>
                </div>
            {/if}
        </Layout.Stack>
        {#key runtime}
            <InputSelect
                id="runtime"
                label="Runtime"
                placeholder="Select runtime"
                bind:value={runtime}
                required
                {options} />
        {/key}

        {#if isCloud}
            <Layout.Stack gap="xs">
                <InputSelect
                    label="CPU and memory"
                    id="specification"
                    placeholder="Select specification"
                    required
                    disabled={specificationOptions.length < 1}
                    options={specificationOptions}
                    bind:value={specification} />
                {#if $organization?.billingPlan === BillingPlan.FREE}
                    <Input.Helper state="default">
                        <Link href={$upgradeURL} variant="muted">Upgrade</Link> to Pro or Scale to adjust
                        your CPU and RAM beyond the default.
                    </Input.Helper>
                {/if}
            </Layout.Stack>
        {/if}
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
