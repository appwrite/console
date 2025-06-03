<script lang="ts">
    import Action from './action.svelte';
    import { setOverviewAction } from '../context';
    import Table from '../(components)/table.svelte';

    export let data;

    setOverviewAction(Action);
</script>

<Table keys={data.devKeys} keyType="dev" />
