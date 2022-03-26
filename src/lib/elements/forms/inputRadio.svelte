<script lang="ts">
    import { FormItem } from '.';

    export let label: string;
    export let id: string;
    export let group: string;
    export let value: string;
    export let name: string;
    export let required = false;
    export let disabled = false;
</script>

<FormItem>
    <div class="input-text-wrapper">
        <input {id} {name} {disabled} {required} {value} type="radio" bind:group />
        <label class="label" for={id}>{label}</label>
    </div>
</FormItem>
