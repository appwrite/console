<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button, FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createDocument } from './store';
    import Attribute from '../document-[document]/attribute.svelte';

    let showCustomId = false;

    function addArrayItem(key: string) {
        createDocument.update((n) => {
            n.document[key].push(null);

            return n;
        });
    }

    function removeArrayItem(key: string, index: number) {
        createDocument.update((n) => {
            n.document[key].splice(index, 1);

            return n;
        });
    }
    $: console.log($createDocument?.document['datearray'] ?? '');
</script>

<WizardStep>
    <svelte:fragment slot="title">Create document data</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Provide document data based on attributes you created earlier.
    </svelte:fragment>

    {#if $createDocument.attributes.length}
        <FormList>
            {#each $createDocument.attributes as attribute}
                {@const label = attribute.required ? `${attribute.key}*` : attribute.key}
                {#if attribute.array}
                    {#each [...$createDocument.document[attribute.key].keys()] as index}
                        <li class="form-item is-multiple">
                            <div class="form-item-part u-stretch">
                                <Attribute
                                    {attribute}
                                    id={`${attribute.key}-${index}`}
                                    label={index === 0 ? label : ''}
                                    bind:value={$createDocument.document[attribute.key][index]} />
                            </div>
                            <div class="form-item-part u-cross-child-end">
                                <Button
                                    text
                                    disabled={index === 0}
                                    on:click={() => removeArrayItem(attribute.key, index)}>
                                    <span class="icon-x" aria-hidden="true" />
                                </Button>
                            </div>
                        </li>
                    {/each}
                    <Button
                        text
                        disabled={$createDocument.document[attribute.key][
                            $createDocument.document[attribute.key].length - 1
                        ] === null}
                        on:click={() => addArrayItem(attribute.key)}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text"> Add item</span>
                    </Button>
                {:else}
                    <FormList>
                        <Attribute
                            {attribute}
                            {label}
                            id={attribute.key}
                            bind:value={$createDocument.document[attribute.key]} />
                    </FormList>
                {/if}
            {/each}
            {#if !showCustomId}
                <div>
                    <Pill button on:click={() => (showCustomId = !showCustomId)}>
                        <span class="icon-pencil" aria-hidden="true" /><span class="text">
                            Document ID
                        </span>
                    </Pill>
                </div>
            {:else}
                <CustomId bind:show={showCustomId} name="Document" bind:id={$createDocument.id} />
            {/if}
        </FormList>
    {/if}
</WizardStep>
