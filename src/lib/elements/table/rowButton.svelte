<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';
</script>

<tr class="table-row" tabindex="0" on:keyup={clickOnEnter} on:click|preventDefault>
    <slot />
</tr>
