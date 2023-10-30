<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import UpdateName from './updateName.svelte';
    import Details from './details.svelte';
</script>

<Container>
    <Details />
    <UpdateName />
    <DangerZone />
</Container>
