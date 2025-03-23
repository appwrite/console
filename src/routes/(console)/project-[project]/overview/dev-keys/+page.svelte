<script lang="ts">
    import type { PageData } from './$types';
    import Action from './action.svelte';
    import { setOverviewAction } from '../context';
    import Table from '../components/table.svelte';

    export let data: PageData;

    setOverviewAction(Action);
</script>

<Table keys={data.devKeys} keyType="dev" />
