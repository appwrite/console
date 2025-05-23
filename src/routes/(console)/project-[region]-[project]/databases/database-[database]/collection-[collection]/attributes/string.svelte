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
    import { ActionMenu, Selector } from '@appwrite.io/pink-svelte';
    import { createConservative } from '$lib/helpers/stores';
    import { InputNumber, InputText, InputTextarea } from '$lib/elements/forms';
    import { Popover, Layout, Tag, Typography, Link } from '@appwrite.io/pink-svelte';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { base } from '$app/paths';
    import { isCloud } from '$lib/system';

    export let data: Partial<Models.AttributeString> = {
        required: false,
        size: 0,
        default: null,
        array: false,
        encrypt: false
    };
    export let editing = false;

    let savedDefault = data.default;

    function handleEncryptedLabelClick(toggle: () => void) {
        if (!hasDatabaseEncryptionPlan) {
            toggle();
        } else {
            data.encrypt = !data.encrypt;
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

    $: hasDatabaseEncryptionPlan = isCloud && $currentPlan?.databasesAllowEncrypt;
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
            bind:checked={data.encrypt}
            disabled={!hasDatabaseEncryptionPlan || editing}
            description="" />

        <Layout.Stack gap="xxs" direction="column">
            <Popover let:toggle placement="bottom-start">
                <button
                    type="button"
                    class="u-cursor-pointer"
                    on:click={(e) => handleEncryptedLabelClick(() => toggle(e))}>
                    <Layout.Stack inline direction="row" alignItems="center">
                        <Typography.Text variant="m-500">Encrypted</Typography.Text>
                        {#if !hasDatabaseEncryptionPlan}
                            <Tag variant="default" size="xs" on:click={toggle}>Pro</Tag>
                        {/if}
                    </Layout.Stack>
                </button>
                <ActionMenu.Root width="180px" slot="tooltip">
                    <Typography.Text variant="m-500">
                        Available on Pro plan.<Link.Anchor
                            href={`${base}/organization-${$organization.$id}/change-plan`}
                            >Upgrade</Link.Anchor> to enable encrypted attributes.
                    </Typography.Text>
                </ActionMenu.Root>
            </Popover>

            <Typography.Text>
                Indicate whether this attribute is encrypted. Encrypted attributes cannot be
                queried.
            </Typography.Text>
        </Layout.Stack>
    </Layout.Stack>
</Layout.Stack>
