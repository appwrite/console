<script lang="ts">
    import { execute } from './store';
    import Execute from './execute.svelte';
</script>

<slot />

<Execute selectedFunction={$execute} />
