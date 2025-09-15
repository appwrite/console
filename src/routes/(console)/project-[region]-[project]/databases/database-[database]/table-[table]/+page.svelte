<script lang="ts">
    import View from './view.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<View {data} />
