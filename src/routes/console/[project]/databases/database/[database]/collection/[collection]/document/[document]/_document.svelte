<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { CardGrid } from '$lib/components';
    import { collection } from '../../store';
    import { doc } from './store';
    import Attribute from './_attribute.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';

    let currentDoc: string;
    let updateBtnDisabled = true;
    onMount(async () => {
        await doc.load($collection.$id, $page.params.document);
        currentDoc = JSON.stringify($doc);
    });

    $: if (currentDoc && $doc) {
        if (currentDoc !== JSON.stringify($doc)) {
            updateBtnDisabled = false;
        } else {
            updateBtnDisabled = true;
        }
    }

    const updateData = async () => {
        try {
            await sdkForProject.databases.updateDocument(
                $collection.$id,
                $page.params.document,
                $doc,
                $doc.$read,
                $doc.$write
            );

            currentDoc = JSON.stringify($doc);
            updateBtnDisabled = true;
            addNotification({
                message: 'Document was updated!',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };
</script>

<CardGrid>
    <h6 class="heading-level-7">Update Data</h6>
    <p>Update document data based on the attributes created earlier.</p>
    <svelte:fragment slot="aside">
        <form class="form u-grid u-gap-16">
            {#each $collection.attributes.filter((a) => a.status === 'available') as attribute}
                {#if attribute.array}
                    <ul class="form-list">
                        {#each $doc[attribute.key] as _v, index}
                            <li class="form-item is-multiple">
                                <div class="form-item-part u-stretch">
                                    <Attribute
                                        {attribute}
                                        id={`${attribute.key}-${index}`}
                                        label={index === 0 ? attribute.key : ''}
                                        bind:value={$doc[attribute.key][index]} />
                                </div>
                                <div class="form-item-part u-cross-child-end">
                                    <Button
                                        text
                                        disabled={index === 0}
                                        on:click={() => doc.removeAttribute(attribute.key, index)}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {:else}
                            <li class="form-item is-multiple">
                                <div class="form-item-part u-stretch">
                                    <Attribute
                                        {attribute}
                                        id={`${attribute.key}-0`}
                                        label={attribute.key}
                                        bind:value={$doc[attribute.key][0]} />
                                </div>
                                <div class="form-item-part u-cross-child-end">
                                    <Button text disabled>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {/each}
                    </ul>

                    <Button
                        text
                        disabled={$doc[attribute.key][$doc[attribute.key].length - 1] === null}
                        on:click={() => {
                            doc.addAttribute(attribute.key);
                        }}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text"> Add attribute</span>
                    </Button>
                {:else}
                    <ul class="form-list">
                        <Attribute
                            {attribute}
                            id={attribute.key}
                            label={attribute.key}
                            bind:value={$doc[attribute.key]} />
                    </ul>
                {/if}
            {/each}
        </form>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={updateBtnDisabled} on:click={() => updateData()}>Update</Button>
    </svelte:fragment>
</CardGrid>
