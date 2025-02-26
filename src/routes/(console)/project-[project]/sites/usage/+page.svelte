<script lang="ts">
    import { Container } from '$lib/layout';

    export let data;

    $: console.log(data.usage);
</script>

<Container>Coming soon</Container>
