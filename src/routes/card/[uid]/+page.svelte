<script lang="ts">
    import Display from '../display.svelte';

    export let data;
</script>

<Display userId={data.userId} variant="external" />
