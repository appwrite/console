<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { InputChoice } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { collection } from '../store';
    import type { Attributes } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isRelationship } from '../document-[document]/attributes/store';
    import Confirm from '$lib/components/confirm.svelte';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { Dependencies } from '$lib/constants';

    let {
        showDelete = $bindable(false),
        selectedAttribute = $bindable(null)
    }: {
        showDelete: boolean;
        selectedAttribute: Attributes | string[];
    } = $props();

    let checked = $state(false);
    let error = $state<string | null>(null);

    const selectedAttributes = $derived(
        Array.isArray(selectedAttribute) ? selectedAttribute : [selectedAttribute]
    );

    const selectedKeys = $derived(getKeys(selectedAttribute));

    const requiresTwoWayConfirm = $derived(
        selectedAttributes.some((attr: string | Attributes) => {
            typeof attr === 'string' ? false : isRelationship(attr) && attr.twoWay;
        })
    );

    const isDeleteBtnDisabled = $derived(requiresTwoWayConfirm && !checked);

    function getKeys(selected: Attributes | string[]): string[] {
        return Array.isArray(selected) ? selected : [selected.key];
    }

    async function handleDelete() {
        try {
            const client = sdk.forProject(page.params.region, page.params.project);

            await Promise.all(
                selectedAttributes.map((key) =>
                    client.databases.deleteAttribute(page.params.database, $collection.$id, key)
                )
            );

            trackEvent(Submit.AttributeDelete);
            addNotification({
                type: 'success',
                message:
                    selectedAttributes.length === 1
                        ? 'Attribute has been deleted'
                        : `${selectedAttributes.length} attributes have been deleted`
            });

            await invalidate(Dependencies.COLLECTION);
            showDelete = false;
            selectedAttribute = [];
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AttributeDelete);
        }
    }
</script>

<Confirm
    bind:open={showDelete}
    onSubmit={handleDelete}
    title="Delete attribute"
    bind:error
    disabled={isDeleteBtnDisabled}>
    {#if selectedAttributes.length === 1}
        <p>
            Are you sure you want to delete <b data-private>{selectedKeys[0]}</b> from
            <b data-private>{$collection?.name}</b>?
        </p>
    {:else}
        <p>
            Are you sure you want to delete <b data-private>{selectedKeys.join(', ')}</b> from
            <b data-private>{$collection?.name}</b>?
        </p>
    {/if}

    {#if requiresTwoWayConfirm}
        <!-- not allowed on multi selections, safe to assume that this isn't a string! -->
        {@const attribute = selectedAttribute[0]}
        <Layout.Stack direction="column" gap="xl">
            <p>
                This is a two way relationship and the corresponding relationship will also be
                deleted.
            </p>
            <p><b>This action is irreversible.</b></p>
            <ul>
                <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                    Delete relationship between <b data-private>{attribute.key}</b> to
                    <b data-private>{attribute.twoWayKey}</b>
                </InputChoice>
            </ul>
        </Layout.Stack>
    {/if}
</Confirm>
