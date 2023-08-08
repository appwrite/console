<script lang="ts">
    import { Modal } from '$lib/components';
    import { option, options } from './attributes/store';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/stores';
    import { addNotification, dismissAllNotifications } from '$lib/stores/notifications';
    import { base } from '$app/paths';
    import type { Attributes } from './store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { preferences } from '$lib/stores/preferences';
    import { feedback } from '$lib/stores/feedback';

    export let showCreate = false;
    export let selectedOption: string = null;
    const databaseId = $page.params.database;
    $: collectionId = $page.params.collection;

    let key: string = null;
    let data: Partial<Attributes> = {
        required: false,
        array: false,
        default: null
    };
    let error: string;

    async function submit() {
        try {
            await $option.create(databaseId, collectionId, key, data);

            let selectedColumns = preferences.getCustomCollectionColumns(collectionId);
            selectedColumns.push(key ?? data?.key);
            preferences.setCustomCollectionColumns(selectedColumns);
            await invalidate(Dependencies.COLLECTION);
            if (!$page.url.pathname.includes('attributes')) {
                await goto(
                    `${base}/console/project-${$page.params.project}/databases/database-${databaseId}/collection-${collectionId}/attributes`
                );
            }
            addNotification({
                type: 'success',
                message: `Attribute ${key ?? data?.key} has been created`
            });
            if ($option.type === 'relationship') {
                let counter = localStorage.getItem('createRelationshipCounter');

                if (counter) {
                    const parsedCounter = parseInt(counter);
                    if (parsedCounter === 2) {
                        addNotification({
                            type: 'info',
                            icon: 'question-mark-circle',
                            message: `How is your experience with our new "Relationships" feature? We'd love to hear your feedback!`,
                            timeout: 15000,
                            buttons: [
                                {
                                    name: 'Give Feedback',
                                    method: () => {
                                        feedback.toggleFeedback();
                                        dismissAllNotifications();
                                    }
                                }
                            ]
                        });
                    } else if (parsedCounter < 2) {
                        localStorage.setItem(
                            'createRelationshipCounter',
                            (parsedCounter + 1).toString()
                        );
                    }
                } else {
                    localStorage.setItem('createRelationshipCounter', '1');
                }
            }
            showCreate = false;
            trackEvent(Submit.AttributeCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AttributeCreate);
        }
    }

    $: if (selectedOption) {
        $option = options.find((option) => option.name === selectedOption);
    }

    $: if (!showCreate) {
        error = null;
        key = null;
        selectedOption = null;
        $option = null;
        data = {
            required: false,
            array: false,
            default: null
        };
    }
</script>

<Modal {error} size="big" bind:show={showCreate} onSubmit={submit} icon={$option?.icon}>
    <svelte:fragment slot="header">
        {#if selectedOption === 'Relationship'}
            <span class="u-flex u-gap-16 u-cross-center">
                {selectedOption}
                <div class="tag eyebrow-heading-3">
                    <span class="text u-x-small">Beta</span>
                </div>
            </span>
        {:else}
            {selectedOption}
        {/if}
    </svelte:fragment>
    <FormList>
        {#if selectedOption !== 'Relationship'}
            <div>
                <InputText
                    id="key"
                    label="Attribute Key"
                    placeholder="Enter Key"
                    bind:value={key}
                    autofocus
                    required />

                <div class="u-flex u-gap-4 u-margin-block-start-8 u-small u-cross-center">
                    <span
                        class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                        aria-hidden="true" />
                    <span class="text u-line-height-1-5">
                        Allowed characters: alphanumeric, hyphen, non-leading underscore, period
                    </span>
                </div>
            </div>
        {/if}
        {#if selectedOption}
            <svelte:component
                this={$option.component}
                bind:data
                on:close={() => ($option = null)} />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit disabled={!selectedOption}>Create</Button>
    </svelte:fragment>
</Modal>
