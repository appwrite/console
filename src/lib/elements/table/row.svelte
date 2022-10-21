<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';
</script>

<div class="table-row" role="row" on:keyup={clickOnEnter} on:click|preventDefault>
    <slot />
</div>
