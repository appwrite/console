<script lang="ts">
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconCheck } from '@appwrite.io/pink-icons-svelte';

    export let status: boolean = false;
</script>

<div class="connection-line u-flex u-cross-center">
    <div
        class="line-left"
        style={`opacity: ${status ? 1 : 0.15}; transition: opacity 5s;`}
        data-status={status}>
    </div>

    <div
        class="tick-container"
        style={`opacity: ${status ? 1 : 0.15}; transition: opacity 2.5s;`}
        data-status={status}>
        {#if status}
            <!-- todo: xs missing atm, need to test -->
            <Icon icon={IconCheck} size="s" color="#fd366e" />
        {/if}
    </div>

    <div
        class="line-right"
        style={`opacity: ${status ? 1 : 0.15}; transition: opacity 5s;`}
        data-status={status}>
    </div>
</div>

<style>
    .connection-line {
        display: flex;
        width: 6.125rem;
        align-items: center;
    }

    .line-left[data-status='false'],
    .line-right[data-status='false'] {
        flex: 1;
        height: 1px;
        background: none;
        border-top: 1px dashed #d8d8db;
    }

    .line-left[data-status='true'] {
        flex: 1;
        height: 1px;
        background: linear-gradient(to left, #f02e65 0%, rgba(254, 149, 103, 0.15) 100%);
    }

    .line-right[data-status='true'] {
        flex: 1;
        height: 1px;
        background: linear-gradient(to right, #f02e65 6.32%, rgba(254, 149, 103, 0.15) 116.81%);
    }

    .tick-container[data-status='false'] {
        width: 7px;
        height: 7px;
        display: flex;
        border-radius: 50%;
        margin-inline: 0.25rem;
        background-color: #ccc;
    }

    .tick-container[data-status='true'] {
        display: flex;
        width: 25px;
        height: 25px;
        color: #fd366e;
        border-radius: 50%;
        align-items: center;
        justify-content: center;
        border: 1.8px solid hsla(343, 98%, 60%, 0.32);
        background-color: hsla(343, 98%, 60%, 0.08);
    }
</style>
