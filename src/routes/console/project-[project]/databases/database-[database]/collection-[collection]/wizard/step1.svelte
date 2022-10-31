<script lang="ts">
    import { CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createDocument } from './store';
    import Attribute from '../document-[document]/attribute.svelte';

    let showCustomId = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Create document data</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Provide document data based on attributes you created earlier.
    </svelte:fragment>

    {#if $createDocument.attributes.length}
        <ul class="form-list">
            {#each $createDocument.attributes as attribute}
                {@const label = attribute.required ? `${attribute.key}*` : attribute.key}
                {#if attribute.array}
                    {#each $createDocument.document[attribute.key] as _v, index}
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
                                    on:click={() => {
                                        $createDocument.document[attribute.key].splice(index, 1);
                                    }}>
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
                                    {label}
                                    bind:value={$createDocument.document[attribute.key][0]} />
                            </div>
                            <div class="form-item-part u-cross-child-end">
                                <Button text disabled>
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
                        on:click={() => {
                            {
                                $createDocument.document[attribute.key].push(null);
                            }
                        }}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text"> Add item</span>
                    </Button>
                {:else}
                    <ul class="form-list">
                        <Attribute
                            {attribute}
                            id={attribute.key}
                            {label}
                            bind:value={$createDocument.document[attribute.key]} />
                    </ul>
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
        </ul>
    {/if}
</WizardStep>
