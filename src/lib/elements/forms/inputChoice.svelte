<script lang="ts">
    import { FormItem } from '.';

    export let type: 'checkbox' | 'switchbox' = 'checkbox';
    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = false;
    export let required = false;
    export let disabled = false;
</script>

<FormItem>
    <label class="choice-item" for={id}>
        <input
            {id}
            {disabled}
            {required}
            type="checkbox"
            class:switch={type === 'switchbox'}
            bind:checked={value} />

        <div class="choice-item-content">
            <div class:u-hide={!showLabel} class="choice-item-title">{label}</div>
            {#if $$slots}
                <p class="choice-item-paragraph"><slot /></p>
            {/if}
        </div>
    </label>
</FormItem>
