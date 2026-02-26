<script lang="ts">
    import { page } from '$app/state';
    import { isCloud } from '$lib/system';
    import { getChangePlanUrl } from '$lib/stores/billing';
    import { currentPlan } from '$lib/stores/organization';
    import {
        ActionMenu,
        Popover,
        Layout,
        Selector,
        Tag,
        Tooltip,
        Typography,
        Link
    } from '@appwrite.io/pink-svelte';

    let {
        encrypt = $bindable(false),
        editing = false,
        disabled = false,
        id = 'encrypt'
    }: {
        encrypt?: boolean;
        editing?: boolean;
        disabled?: boolean;
        id?: string;
    } = $props();

    const organizationId = page.data?.organization?.$id ?? page.data?.project?.$id;
    const supportsEncryption = isCloud ? $currentPlan?.databasesAllowEncrypt : true;
</script>

<Tooltip disabled={!(editing || disabled)} maxWidth="275px" placement="bottom-start">
    <div
        class="popover-holder"
        class:cursor-not-allowed={editing || disabled}
        class:disabled-checkbox={!supportsEncryption || editing || disabled}>
        <Layout.Stack inline gap="s" alignItems="flex-start" direction="row">
            <Popover let:toggle placement="bottom-start">
                <Selector.Checkbox
                    size="s"
                    {id}
                    bind:checked={encrypt}
                    disabled={!supportsEncryption || editing || disabled} />

                <Layout.Stack gap="xxs" direction="column">
                    <button
                        type="button"
                        disabled={editing || disabled}
                        class:cursor-pointer={!editing}
                        class:cursor-not-allowed={editing || disabled}
                        onclick={(e) => {
                            if (!supportsEncryption) {
                                toggle(e);
                            } else {
                                encrypt = !encrypt;
                            }
                        }}>
                        <Layout.Stack inline gap="xxs" direction="row" alignItems="center">
                            <Typography.Text variant="m-500">Encrypted</Typography.Text>
                            {#if !supportsEncryption}
                                <Tag variant="default" size="xs">Pro</Tag>
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
                        Available on Pro plan. <Link.Anchor href={getChangePlanUrl(organizationId)}
                            >Upgrade</Link.Anchor>
                        to enable encrypted columns.
                    </Typography.Text>
                </ActionMenu.Root>
            </Popover>
        </Layout.Stack>
    </div>

    <svelte:fragment slot="tooltip">
        Encryption can only be set when creating the column.
    </svelte:fragment>
</Tooltip>

<style lang="scss">
    .popover-holder {
        & :global([role='tooltip']) {
            margin-top: 4px;
            left: 8rem !important;
        }

        &.disabled-checkbox :global(button) {
            cursor: unset;
        }
    }

    .cursor-pointer {
        cursor: pointer !important;
    }

    .cursor-not-allowed {
        cursor: not-allowed;
    }
</style>
