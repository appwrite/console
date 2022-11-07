<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';
</script>

<!-- svelte-ignore a11y-unknown-role -->
<tr
    class="table-row"
    role="row button"
    tabindex="0"
    on:keyup={clickOnEnter}
    on:click|preventDefault>
    <slot />
</tr>
