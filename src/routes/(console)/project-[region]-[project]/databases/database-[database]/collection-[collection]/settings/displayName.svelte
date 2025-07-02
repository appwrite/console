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
    import { organization } from '$lib/stores/organization';
    import { onMount } from 'svelte';

    const collectionId = page.params.collection;
    let names: string[] = [];

    onMount(async () => {
        if ($organization?.$id) {
            try {
                await preferences.loadTeamPrefs($organization.$id);
                const savedNames = $preferences?.displayNames?.[collectionId] ?? [];
                names = [...savedNames];
            } catch (error) {
                names = [];
            }
        } else {
            names = [];
        }
    });

    async function updateDisplayName() {
        if (!$organization?.$id) {
            addNotification({
                message: 'Organization ID not found. Please refresh the page.',
                type: 'error'
            });
            return;
        }

        try {
            await preferences.setDisplayNames($organization.$id, collectionId, names);

            await preferences.loadTeamPrefs($organization.$id);

            const reloadedNames = [...($preferences?.displayNames?.[collectionId] ?? [])];
            names = reloadedNames;

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
        !symmetricDifference(names, $preferences?.displayNames?.[collectionId] ?? [])?.length ||
        (names?.length && !last(names));
</script>

<Form onSubmit={updateDisplayName}>
    <CardGrid>
        <svelte:fragment slot="title">Display name</svelte:fragment>
        Select up to 5 string attributes to display as document names in the Appwrite console. These
        help identify documents in places like relationships.

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
                    {#each names as _, i}
                        <Layout.Stack direction="row" gap="xxs">
                            <InputSelect
                                id={`display-name-${i}`}
                                placeholder="Select attribute"
                                value={names[i]}
                                on:change={(e) => {
                                    names[i] = e.detail;
                                    names = [...names];
                                }}
                                disabled={!!names[i] && names.length > i + 1}
                                {options} />
                            <Button
                                icon
                                extraCompact
                                on:click={() => {
                                    names.splice(i, 1);
                                    names = [...names];
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
                            names = [...names, null];
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
