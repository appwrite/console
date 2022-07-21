<script lang="ts">
    import { FormItem } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value: string;
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let options: {
        value: string;
        label: string;
    }[];
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="select">
        <select bind:value {id} {required} {disabled}>
            {#if placeholder}
                <option value="" disabled selected hidden>{placeholder}</option>
            {/if}
            {#each options as option}
                <option value={option.value} selected={option.value === value}>
                    {option.label}
                </option>
            {/each}
        </select>
        <span class="icon-cheveron-down" aria-hidden="true" />
    </div>
</FormItem>
