<script lang="ts">
    export let status:
        | 'waiting'
        | 'pending'
        | 'failed'
        | 'completed'
        | 'processing'
        | 'ready'
        | 'building'
        | 'none';

    export let statusIconStyle: string | undefined = undefined;
</script>

<div
    class="status u-cross-center"
    class:is-pending={status === 'pending'}
    class:is-failed={status === 'failed'}
    class:is-complete={status === 'completed' || status === 'ready'}
    class:is-processing={status === 'processing' || status === 'building'}>
    {#if status}
        <span class="status-icon" style={statusIconStyle} />
    {/if}
    <span class="text" data-private><slot /></span>
</div>

<style>
    .status-icon {
        width: 8px;
        height: 8px;
    }

    .status {
        gap: 6px;
    }

    .text {
        line-height: 140%;
    }
</style>
