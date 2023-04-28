<script lang="ts">
    import Display from './display.svelte';

    export let data;
</script>

<Display userId={data.account.$id} variant="owner" />
