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
                data.array,
                data.encrypt
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
    import { isCloud } from '$lib/system';
    import { upgradeURL } from '$lib/stores/billing';
    import { currentPlan } from '$lib/stores/organization';
    import { createConservative } from '$lib/helpers/stores';
    import { ActionMenu, Selector } from '@appwrite.io/pink-svelte';
    import { InputNumber, InputText, InputTextarea } from '$lib/elements/forms';
    import { Popover, Layout, Tag, Typography, Link } from '@appwrite.io/pink-svelte';

    export let data: Partial<Models.AttributeString> = {
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
    } = createConservative<Partial<Models.AttributeString>>({
        required: false,
        array: false,
        ...data
    });

    $: listen(data);

    $: handleDefaultState($required || $array);

    // check plan on cloud, always allow on self-hosted!
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
        ? 'Encrypted string attributes require a minimum size of 150.'
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
    description="Indicate whether this attribute is required." />

<Selector.Checkbox
    size="s"
    id="array"
    label="Array"
    bind:checked={data.array}
    disabled={data.required || editing}
    description="Indicate whether this attribute is an array. Defaults to an empty array." />

<Layout.Stack gap="xs" direction="column">
    <div class="popover-holder" class:disabled-checkbox={!supportsStringEncryption || editing}>
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
                        class="u-cursor-pointer"
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
                        Indicate whether this attribute is encrypted. Encrypted attributes cannot be
                        queried.
                    </Typography.Text>
                </Layout.Stack>

                <ActionMenu.Root width="180px" slot="tooltip">
                    <Typography.Text variant="m-500">
                        Available on Pro plan. <Link.Anchor href={$upgradeURL}>Upgrade</Link.Anchor>
                        to enable encrypted attributes.
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
            cursor: unset !important;
        }
    }
</style>
