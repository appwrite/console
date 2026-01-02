<script lang="ts">
    import type { PageData } from './$types';
    import KeyDetails from '../../../../project-[region]-[project]/overview/(components)/keyDetails.svelte';

    export let data: PageData;
</script>

<KeyDetails key={data.key} keyType="account" />
