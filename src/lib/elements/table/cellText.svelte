<script lang="ts">
    import { Trim } from '$lib/components';
    export let title: string;
    export let showOverflow = false;
</script>

<div class="table-col " class:u-overflow-visible={showOverflow} data-title={title} role="cell">
    <Trim><slot /></Trim>
</div>
