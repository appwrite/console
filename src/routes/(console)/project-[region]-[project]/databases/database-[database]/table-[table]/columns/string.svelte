<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitString(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnString>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createStringColumn({
            databaseId,
            tableId,
            key,
            size: data.size,
            required: data.required,
            xdefault: data.default,
            array: data.array,
            encrypt: data.encrypt
        });
    }
    export async function updateString(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnString>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateStringColumn({
            databaseId,
            tableId,
            key: originalKey,
            required: data.required,
            xdefault: data.default,
            size: data.size,
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { isCloud } from '$lib/system';
    import { upgradeURL } from '$lib/stores/billing';
    import { currentPlan } from '$lib/stores/organization';
    import { createConservative } from '$lib/helpers/stores';
    import { ActionMenu, Selector } from '@appwrite.io/pink-svelte';
    import { InputNumber, InputText, InputTextarea } from '$lib/elements/forms';
    import { Popover, Layout, Tag, Typography, Link } from '@appwrite.io/pink-svelte';

    export let data: Partial<Models.ColumnString> = {
        required: false,
        size: 0,
        array: false,
        encrypt: false
    };

    export let editing = false;

    let savedDefault = data.default;

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
    } = createConservative<Partial<Models.ColumnString>>({
        required: false,
        array: false,
        ...data
    });

    $: listen(data);

    $: handleDefaultState($required || $array);

    // Check plan on cloud, always allow on self-hosted
    $: supportsStringEncryption = isCloud ? $currentPlan?.databasesAllowEncrypt : true;
</script>

<InputNumber
    id="size"
    label="Size"
    required
    placeholder="Enter size"
    bind:value={data.size}
    min={supportsStringEncryption && data.encrypt ? 150 : undefined}
    helper={supportsStringEncryption && data.encrypt
        ? 'Encrypted string columns require a minimum size of 150.'
        : undefined} />

<svelte:component
    this={data.size >= 50 ? InputTextarea : InputText}
    id="default"
    label="Default"
    placeholder="Enter string"
    maxlength={data.size}
    bind:value={data.default}
    disabled={data.required || data.array}
    nullable={!data.required && !data.array} />

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this column is required." />

<Selector.Checkbox
    size="s"
    id="array"
    label="Array"
    bind:checked={data.array}
    disabled={data.required || editing}
    description="Indicate whether this column is an array. Defaults to an empty array." />

<Layout.Stack gap="xs" direction="column">
    <div
        class="popover-holder"
        class:cursor-not-allowed={editing}
        class:disabled-checkbox={!supportsStringEncryption || editing}>
        <Layout.Stack inline gap="s" alignItems="flex-start" direction="row">
            <Popover let:toggle placement="bottom-start">
                <Selector.Checkbox
                    size="s"
                    id="encrypt"
                    bind:checked={data.encrypt}
                    disabled={!supportsStringEncryption || editing} />

                <Layout.Stack gap="xxs" direction="column">
                    <button
                        type="button"
                        disabled={editing}
                        class:cursor-pointer={!editing}
                        class:cursor-not-allowed={editing}
                        on:click={(e) => {
                            if (!supportsStringEncryption) {
                                toggle(e);
                            } else {
                                data.encrypt = !data.encrypt;
                            }
                        }}>
                        <Layout.Stack inline gap="xxs" direction="row" alignItems="center">
                            <Typography.Text variant="m-500">Encrypted</Typography.Text>
                            {#if !supportsStringEncryption}
                                <Tag variant="default" size="xs" on:click={toggle}>Pro</Tag>
                            {/if}
                        </Layout.Stack>
                    </button>
                    <Typography.Text color="--fgcolor-neutral-tertiary">
                        Protect column against data leaks for best privacy compliance. Encrypted
                        columns cannot be queried.
                    </Typography.Text>
                </Layout.Stack>

                <ActionMenu.Root width="180px" slot="tooltip">
                    <Typography.Text variant="m-500">
                        Available on Pro plan. <Link.Anchor href={$upgradeURL}>Upgrade</Link.Anchor>
                        to enable encrypted columns.
                    </Typography.Text>
                </ActionMenu.Root>
            </Popover>
        </Layout.Stack>
    </div>
</Layout.Stack>

<style lang="scss">
    .popover-holder {
        & :global([role='tooltip']) {
            margin-top: 4px;
            left: 8rem !important;
        }

        // no cursor when disabled
        &.disabled-checkbox :global(button) {
            cursor: unset;
        }
    }

    .cursor-pointer {
        // !important is needed
        cursor: pointer !important;
    }

    .cursor-not-allowed {
        cursor: not-allowed;
    }
</style>
