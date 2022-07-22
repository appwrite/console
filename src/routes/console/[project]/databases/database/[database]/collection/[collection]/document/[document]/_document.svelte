<script lang="ts">
    import { Collapsible } from '$lib/components';
    import { Button, InputTags } from '$lib/elements/forms';
    import { collection } from '../../store';
    import { doc } from './store';
    import Attribute from './_attribute.svelte';
</script>

{#each $collection.attributes.filter((a) => a.status === 'available') as attribute}
    {#if attribute.array}
        {#each $doc[attribute.key] as _v, index}
            <Attribute
                {attribute}
                id={`${attribute.key}-${index}`}
                label={index === 0 ? attribute.key : ''}
                bind:value={$doc[attribute.key][index]} />
            <Button on:click={() => doc.removeAttribute(attribute.key, index)}>X</Button>
        {:else}
            <p>{attribute.key}</p>
        {/each}
        <Button on:click={() => doc.addAttribute(attribute.key)}>Add Attribute</Button>
    {:else}
        <Attribute
            {attribute}
            id={attribute.key}
            label={attribute.key}
            bind:value={$doc[attribute.key]} />
    {/if}
{/each}
<Collapsible>
    <svelte:fragment slot="header">Permissions</svelte:fragment>
    <InputTags
        id="read"
        label="Read Permissions"
        bind:tags={$doc.$read}
        helper="Add 'role:all' for wildcard access"
        placeholder="User ID, Team ID or Role" />
    <InputTags
        id="write"
        label="Write Permissions"
        bind:tags={$doc.$write}
        helper="Add 'role:all' for wildcard access"
        placeholder="User ID, Team ID or Role" />
</Collapsible>
