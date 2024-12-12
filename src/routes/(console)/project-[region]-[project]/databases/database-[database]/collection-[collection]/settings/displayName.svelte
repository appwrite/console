<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelectSearch, InputText } from '$lib/elements/forms';
    import { last, symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { attributes } from '../store';
    import { preferences } from '$lib/stores/preferences';
    import { page } from '$app/stores';

    const collectionId = $page.params.collection;
    let names: string[] = [...(preferences.getDisplayNames()?.[collectionId] ?? [])];
    let search: string;

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
        <Heading tag="h6" size="7" id="display-name">Display name</Heading>
        <p class="text">
            Select string attributes as display names for your documents. The selected names will be
            used as short forms to identify documents in the Appwrite console, like when creating
            database relationships. You can specify up to 5 names.
        </p>

        <svelte:fragment slot="aside">
            <div class="u-flex u-flex-vertical u-gap-4">
                <ul class="u-flex-vertical u-gap-8">
                    <li class="u-flex u-gap-8">
                        <InputText
                            id="id"
                            label="Document ID"
                            showLabel={false}
                            placeholder="Document ID"
                            readonly
                            fullWidth />
                        <div class="form-item-part u-cross-child-end u-opacity-0">
                            <Button text noMargin disabled>
                                <span class="icon-x" aria-hidden="true" />
                            </Button>
                        </div>
                    </li>
                    {#if names?.length}
                        {#each names as name, i}
                            <div class="u-flex u-gap-8">
                                {#if names[i]}
                                    <InputSelectSearch
                                        id={name}
                                        label={name}
                                        showLabel={false}
                                        interactiveOutput
                                        placeholder="Select attribute"
                                        bind:value={names[i]}
                                        bind:search={names[i]}
                                        name="attributes"
                                        disabled
                                        {options} />
                                {:else}
                                    <InputSelectSearch
                                        id={name}
                                        label={name}
                                        showLabel={false}
                                        placeholder="Select attribute"
                                        bind:value={names[i]}
                                        bind:search
                                        name="attributes"
                                        {options} />
                                {/if}
                                <div class="form-item-part u-cross-child-end">
                                    <Button
                                        text
                                        noMargin
                                        on:click={() => {
                                            names.splice(i, 1);
                                            names = names;
                                        }}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </ul>
                <Button
                    noMargin
                    text
                    disabled={addAttributeDisabled}
                    on:click={() => {
                        names[names.length] = null;
                        search = null;
                        names = names;
                    }}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add attribute</span>
                </Button>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={updateBtnDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
