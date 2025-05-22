<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitString(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.createStringAttribute(
                databaseId,
                collectionId,
                key,
                data.size,
                data.required,
                data.default,
                data.array
            );
    }
    export async function updateString(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeString>,
        originalKey?: string
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .databases.updateStringAttribute(
                databaseId,
                collectionId,
                originalKey,
                data.required,
                data.default,
                data.size,
                data.key !== originalKey ? data.key : undefined
            );
    }
</script>

<script lang="ts">
    import { ActionMenu, Selector } from '@appwrite.io/pink-svelte';
    import { createConservative } from '$lib/helpers/stores';
    import { InputNumber, InputText, InputTextarea } from '$lib/elements/forms';
    import { Popover, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { $organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';

    export let data: Partial<Models.AttributeString> = {
        required: false,
        size: 0,
        default: null,
        array: false,
        encrypted: false
    };
    export let editing = false;

    let savedDefault = data.default;

    function handleCheckboxClick(toggle: () => void) {
        if ($organization?.billingPlan === BillingPlan.FREE) {
            toggle();
        }
    }

    function handleButtonClick(toggle: () => void) {
        if ($organization?.billingPlan === BillingPlan.FREE) {
            toggle();
        } else {
            data.encrypted = !data.encrypted;
        }
    }

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault;
        }
    }

    const {
        stores: { required, array },
        listen
    } = createConservative<Partial<Models.AttributeString>>({
        required: false,
        array: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required || $array);
</script>

<InputNumber
    id="size"
    label="Size"
    placeholder="Enter size"
    bind:value={data.size}
    required={true} />
{#if data.size >= 50}
    <InputTextarea
        id="default"
        label="Default"
        placeholder="Enter string"
        disabled={data.required || data.array}
        nullable={!data.required && !data.array}
        maxlength={data.size}
        bind:value={data.default} />
{:else}
    <InputText
        id="default"
        label="Default"
        placeholder="Enter string"
        disabled={data.required || data.array}
        nullable={!data.required && !data.array}
        maxlength={data.size}
        bind:value={data.default} />
{/if}
<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this attribute is required" />
<Selector.Checkbox
    size="s"
    id="array"
    label="Array"
    bind:checked={data.array}
    disabled={data.required || editing}
    description="Indicate whether this attribute should act as an array, with the default value set as an empty
    array." />
<Layout.Stack gap="xs" direction="column">
    <Layout.Stack inline gap="s" alignItems="flex-start" direction="row">
        <Selector.Checkbox
            size="s"
            id="encrypted"
            bind:checked={data.encrypted}
            on:click={(e) => handleCheckboxClick(() => toggle(e))}
            disabled={editing || $organization.billingPlan === BillingPlan.FREE}
            description="" />

        <!-- Stack button and description in a column -->
        <Layout.Stack gap="xxs" direction="column">
            <Popover let:toggle placement="bottom-start">
                <button
                    type="button"
                    class="u-cursor-pointer"
                    on:click={(e) => handleButtonClick(() => toggle(e))}>
                    <Layout.Stack inline direction="row" alignItems="center">
                        <Typography.Text variant="m-500">Encrypted</Typography.Text>
                        {#if $organization?.billingPlan === BillingPlan.FREE}
                            <Tag variant="default" size="xs" on:click={toggle}>Pro</Tag>
                        {/if}
                    </Layout.Stack>
                </button>
                <ActionMenu.Root width="180px" slot="tooltip">
                    <Typography.Text variant="m-500">
                        Available on Pro plan. Upgrade to enable encrypted attributes.
                    </Typography.Text>
                </ActionMenu.Root>
            </Popover>

            <!-- Description text stacked below the button -->
            <Typography.Text>
                Indicate whether this attribute is encrypted. Encrypted attributes cannot be
                queried.
            </Typography.Text>
        </Layout.Stack>
    </Layout.Stack>
</Layout.Stack>
