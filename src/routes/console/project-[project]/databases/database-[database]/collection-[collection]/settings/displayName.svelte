<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelectSearch, InputText } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { teamPrefs } from '$lib/stores/team';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { attributes, collection } from '../store';

    let displayNames = [];
    let search: string;

    onMount(async () => {
        await teamPrefs.load($organization.$id);

        $teamPrefs.displayNames ??= {};
        $teamPrefs.displayNames[$collection.$id] ??= [];
        displayNames = [...$teamPrefs.displayNames[$collection.$id]];
    });

    async function updateDisplayName() {
        try {
            const pref = {
                ...$teamPrefs,
                displayNames: {
                    ...$teamPrefs.displayNames,
                    [$collection.$id]: displayNames
                }
            };
            await teamPrefs.updatePrefs($organization.$id, pref);
            await invalidate(Dependencies.TEAM);
            addNotification({
                message: 'Display names has been updated',
                type: 'success'
            });
            trackEvent(Submit.CollectionUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.CollectionUpdateName);
        }
    }

    $: options = ($attributes as Models.AttributeString[])
        .filter(
            (attr) =>
                attr.type === 'string' &&
                attr?.size <= 50 &&
                !attr?.array &&
                !displayNames?.some((name) => name === attr.key)
        )
        .map((attr) => {
            return {
                value: attr.key,
                label: attr.key
            };
        });

    $: addAttributeDisabled =
        displayNames?.length >= 5 ||
        (displayNames?.length && !displayNames[displayNames?.length - 1]);

    $: updateBtnDisabled = !symmetricDifference(
        displayNames,
        $teamPrefs?.displayNames?.[$collection.$id] ?? []
    )?.length;
</script>

<Form onSubmit={updateDisplayName}>
    <CardGrid>
        <Heading tag="h6" size="7">Display Name</Heading>
        <p class="text">
            Set string attributes with maximum 50 characters to be used as a display name in the
            Appwrite console. Maximum 5 names.
        </p>

        <svelte:fragment slot="aside">
            <div class="u-flex u-flex-vertical u-gap-4">
                <ul class="u-flex-vertical u-gap-4 u-margin-block-start-4">
                    <InputText
                        id="id"
                        label="Document ID"
                        showLabel={false}
                        placeholder="Document ID"
                        readonly />
                    {#if displayNames?.length}
                        {#each displayNames as name, i}
                            <div class="u-flex u-gap-8">
                                {#if displayNames[i]}
                                    <InputSelectSearch
                                        id={name}
                                        label={name}
                                        showLabel={false}
                                        interactiveOutput
                                        placeholder="Select attribute"
                                        bind:value={displayNames[i]}
                                        bind:search={displayNames[i]}
                                        name="attributes"
                                        disabled
                                        {options} />
                                {:else}
                                    <InputSelectSearch
                                        id={name}
                                        label={name}
                                        showLabel={false}
                                        placeholder="Select attribute"
                                        bind:value={displayNames[i]}
                                        bind:search
                                        name="attributes"
                                        {options} />
                                {/if}
                                <div class="form-item-part u-cross-child-end">
                                    <Button
                                        text
                                        noMargin
                                        on:click={() => {
                                            displayNames.splice(i, 1);
                                            displayNames = displayNames;
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
                        displayNames[displayNames.length] = null;
                        search = null;
                        displayNames = displayNames;
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
