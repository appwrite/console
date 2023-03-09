<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelectSearch, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { attributes, collection } from '../store';

    const databaseId = $page.params.database;

    let displayNames: string[] = null;

    onMount(() => {
        displayNames ??= [];
    });

    async function updateDisplayName() {
        try {
            invalidate(Dependencies.COLLECTION);
            addNotification({
                message: 'Name has been updated',
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

    $: options = $attributes
        .filter((attr) => attr.type === 'string' && attr?.size <= 50)
        .map((attr) => {
            return {
                value: attr.key,
                label: attr.key
            };
        });

    $: addAttributeDisabled =
        displayNames?.length >= 5 ||
        (displayNames?.length && !displayNames[displayNames?.length - 1]);
</script>

<Form on:submit={updateDisplayName}>
    <CardGrid>
        <Heading tag="h6" size="7">Display Name</Heading>
        <p class="text">
            Set string attributes with maximum 50 characters to be used as a display name in the
            Appwrite console. Maximum 5 names.
        </p>

        <svelte:fragment slot="aside">
            <ul class="form-list">
                <InputText
                    id="id"
                    label="Document ID"
                    showLabel={false}
                    placeholder="Document ID"
                    disabled />
                {#if displayNames?.length}
                    {#each displayNames as name, i}
                        <InputSelectSearch
                            id={name}
                            label={name}
                            showLabel={false}
                            placeholder="Select attribute"
                            bind:value={displayNames[i]}
                            {options} />
                    {/each}
                {/if}
                <Button
                    noMargin
                    text
                    disabled={addAttributeDisabled}
                    on:click={() => {
                        displayNames[displayNames.length] = null;
                        displayNames = displayNames;
                    }}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add attribute</span>
                </Button>
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={displayNames === $collection.name || !displayNames} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
