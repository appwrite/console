<script lang="ts">
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import Apps from './apps.svelte';
    import Installations from './installations.svelte';
    import Keys from './keys.svelte';

    export let data: PageData;
</script>

<Container>
    <Keys keys={data.keys} />
    <Installations />
    <Apps />
</Container>
