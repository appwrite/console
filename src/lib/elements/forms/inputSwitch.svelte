<script lang="ts">
    import { FormItem } from '.';

    export let label: string;
    export let id: string;
    export let value = false;
    export let required = false;
    export let disabled = false;
</script>

<FormItem>
    <label class="choice-item" for={id}>
        <div class="input-text-wrapper">
            <input
                {id}
                {disabled}
                {required}
                type="checkbox"
                class="switch"
                role="switch"
                bind:checked={value}
                on:change />
        </div>
        <div class="choice-item-content">
            <div class="choice-item-title">{label}</div>
        </div>
    </label>
</FormItem>
