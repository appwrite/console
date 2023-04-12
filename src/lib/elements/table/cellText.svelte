<script lang="ts">
    import { Trim } from '$lib/components';
    export let title: string;
    export let showOverflow = false;
    export let onlyDesktop = false;
    export let width: number = null;
</script>

<div
    class="table-col"
    style:--p-col-width={width?.toString()}
    class:is-only-desktop={onlyDesktop}
    class:u-overflow-visible={showOverflow}
    style={width ? `--p-col-width:${width?.toString()}` : ''}
    data-title={title}
    role="cell"
    data-private>
    <Trim><slot /></Trim>
</div>
