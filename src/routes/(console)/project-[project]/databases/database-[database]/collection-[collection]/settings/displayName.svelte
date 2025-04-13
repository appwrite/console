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

    const collectionId = page.params.collection;
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
        Select string attributes as display names for your documents. The selected names will be used
        as short forms to identify documents in the Appwrite console, like when creating database relationships.
        You can specify up to 5 names.

        <svelte:fragment slot="aside">
            <Layout.Stack gap="s">
                <Layout.Stack direction="row" gap="xxs">
                    <InputText id="id" value="Document ID" readonly />
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
                                placeholder="Select attribute"
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
                        Add attribute
                    </Button>
                </div>
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={updateBtnDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
