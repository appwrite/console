<script lang="ts">
    import { Trim } from '$lib/components';
    export let title: string;
    export let showOverflow = false;
    export let onlyDesktop = false;
</script>

<div
    class="table-col"
    class:is-only-desktop={onlyDesktop}
    class:u-overflow-visible={showOverflow}
    data-title={title}
    role="cell">
    <Trim><slot /></Trim>
</div>
