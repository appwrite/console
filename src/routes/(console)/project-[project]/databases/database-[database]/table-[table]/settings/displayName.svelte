<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputText } from '$lib/elements/forms';
    import { last, symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { attributes } from '../store';
    import { preferences } from '$lib/stores/preferences';
    import { page } from '$app/state';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';

    const collectionId = page.params.table;
    let names: string[] = [...(preferences.getDisplayNames()?.[collectionId] ?? [])];

    async function updateDisplayName() {
        try {
            await preferences.setDisplayNames(collectionId, names);
            names = [...(preferences.getDisplayNames()?.[collectionId] ?? [])];
            await invalidate(Dependencies.TEAM);
            addNotification({
                message: 'Display names has been updated',
                type: 'success'
            });
            trackEvent(Submit.CollectionUpdateDisplayNames);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.CollectionUpdateDisplayNames);
        }
    }

    $: options = ($attributes as Models.AttributeString[])
        .filter(
            (attr) =>
                attr.type === 'string' && !attr?.array && !names?.some((name) => name === attr.key)
        )
        .map((attr) => {
            return {
                value: attr.key,
                label: attr.key
            };
        });

    $: addAttributeDisabled = names?.length >= 5 || (names?.length && !names[names?.length - 1]);

    $: updateBtnDisabled =
        !symmetricDifference(names, preferences.getDisplayNames()?.[collectionId] ?? [])?.length ||
        (names?.length && !last(names));
</script>

<Form onSubmit={updateDisplayName}>
    <CardGrid>
        <svelte:fragment slot="title">Display name</svelte:fragment>
        Select up to 5 string columns to display as row names in the Appwrite console. These help identify
        rows in places like relationships.

        <svelte:fragment slot="aside">
            <Layout.Stack gap="s">
                <Layout.Stack direction="row" gap="xxs">
                    <InputText id="id" value="Row ID" readonly />
                    <span style:visibility="hidden">
                        <Button icon extraCompact>
                            <Icon icon={IconX} />
                        </Button>
                    </span>
                </Layout.Stack>
                {#if names?.length}
                    {#each names as name, i}
                        <Layout.Stack direction="row" gap="xxs">
                            <InputSelect
                                id={name}
                                placeholder="Select column"
                                bind:value={names[i]}
                                disabled={!!names[i] && names.length > i + 1}
                                {options} />
                            <Button
                                icon
                                extraCompact
                                on:click={() => {
                                    names.splice(i, 1);
                                    names = names;
                                }}>
                                <Icon icon={IconX} />
                            </Button>
                        </Layout.Stack>
                    {/each}
                {/if}
                <div>
                    <Button
                        compact
                        disabled={addAttributeDisabled}
                        on:click={() => {
                            names[names.length] = null;
                            names = names;
                        }}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add column
                    </Button>
                </div>
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={updateBtnDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
