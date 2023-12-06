<script lang="ts">
    import { InputRadio } from '$lib/elements/forms';

    export let total: number;
    export let variableName: string = '$id';
    export let elements: Record<string, unknown>[];
    export let group: string;
    export let name: string;
</script>

<div class:boxes-wrapper={total} data-private>
    {#if total}
        {#each elements as element}
            {@const value = element[variableName]?.toString()}
            <div class="box">
                <InputRadio id={`${name}-${element[variableName]}`} {value} {name} bind:group>
                    <slot name="element" {element} />
                </InputRadio>
            </div>
        {/each}
    {/if}

    <div class="box">
        {#if total}
            <InputRadio id="payment-method" value={null} {name} bind:group>
                <slot name="new">
                    <span style="padding-inline:0.25rem">Add new {name}</span>
                </slot>
            </InputRadio>
        {/if}
        {#if group === null}
            <slot />
        {/if}
    </div>
</div>
