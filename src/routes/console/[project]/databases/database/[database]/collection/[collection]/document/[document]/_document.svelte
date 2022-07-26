<script lang="ts">
    import { Button, FormItem } from '$lib/elements/forms';
    import { CardGrid } from '$lib/components';
    import { collection } from '../../store';
    import { doc } from './store';
    import Attribute from './_attribute.svelte';
</script>

<CardGrid>
    <h6 class="heading-level-7">Update Data</h6>
    <p>Update document data based on the attributes created earlier.</p>
    <svelte:fragment slot="aside">
        <ul class="common-section form-list">
            {#each $collection.attributes.filter((a) => a.status === 'available') as attribute}
                <FormItem>
                    {#if attribute.array}
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
                                        on:click={() => doc.removeAttribute(attribute.key, index)}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {:else}
                            <p>{attribute.key}</p>
                        {/each}

                        <Button text on:click={() => doc.addAttribute(attribute.key)}>
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="text"> Add Attribute</span>
                        </Button>
                    {:else}
                        <Attribute
                            {attribute}
                            id={attribute.key}
                            label={attribute.key}
                            bind:value={$doc[attribute.key]} />
                    {/if}
                </FormItem>
            {/each}
        </ul>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={true} on:click={() => {}}>Update</Button>
    </svelte:fragment>
</CardGrid>
