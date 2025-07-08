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

    const collectionId = page.params.collection;

    function getDisplayNames() {
        return [...(preferences.getDisplayNames()?.[collectionId] ?? [])].filter(
            (name) => name !== '$id'
        ); // edge case with `$id`? got saved during tests!
    }

    let names: string[] = $state(getDisplayNames());

    async function updateDisplayName() {
        try {
            // $state makes proxy,
            // structuredClone doesn't work
            const regularArray = [...names];

            await preferences.setDisplayNames($organization.$id, collectionId, regularArray);
            names = getDisplayNames();

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

    function getValidAttributes() {
        return ($attributes as Models.AttributeString[]).filter(
            (attr) => attr.type === 'string' && !attr?.array
        );
    }

    function getOptions(index: number) {
        const current = names?.[index];
        return getValidAttributes()
            .filter((attr) => !names?.includes(attr.key) || attr.key === current)
            .map((attr) => ({
                value: attr.key,
                label: attr.key
            }));
    }

    const addAttributeDisabled = $derived(
        names?.length >= 5 || (names?.length && !names[names?.length - 1])
    );

    const updateBtnDisabled = $derived(
        !symmetricDifference(names, preferences.getDisplayNames()?.[collectionId] ?? [])?.length ||
            (names?.length && !last(names))
    );

    const hasExhaustedOptions = $derived(getValidAttributes().length === names?.length);
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
                    {#each names as name, index}
                        <Layout.Stack direction="row" gap="xxs">
                            {@const options = getOptions(index)}
                            {@const disabled =
                                (!!names[index] && names.length > index + 1) || hasExhaustedOptions}
                            <InputSelect
                                id={name}
                                {options}
                                {disabled}
                                bind:value={names[index]}
                                placeholder="Select attribute" />
                            <Button
                                icon
                                extraCompact
                                on:click={() => {
                                    names.splice(index, 1);
                                    names = names;
                                }}>
                                <Icon icon={IconX} />
                            </Button>
                        </Layout.Stack>
                    {/each}
                {/if}

                <!-- show only when options don't have all the attributes -->
                {#if !hasExhaustedOptions}
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
                {/if}
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={updateBtnDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
