<script lang="ts">
    const testPopovers = [
        {
            title: 'Test Popover 1',
            copy: 'This is a test popover.'
        },
        {
            title: 'Test Popover 2',
            copy: 'This is another test popover.'
        }
    ];

    type PopoverProps = {
        index: number;
        title: string;
        copy: string;
    };
</script>

<div class="popover-container">
    {#each testPopovers as { title, copy }, index}
        {@render ProductUpdatePopover({ index, title, copy })}
    {/each}
</div>

{#snippet ProductUpdatePopover({ index, title, copy }: PopoverProps)}
    <div
        class="popover"
        style:--y-offset={(testPopovers.length - 1 - index) * 20 + 'px'}
        style:--z-index={1 * index}
        style:--scale={1 - (testPopovers.length - 1 - index) * 0.05}>
        <div class="popover-content">
            <span>{title}</span>
            <span>{copy}</span>
        </div>
    </div>
{/snippet}

<style>
    .popover-container {
        position: relative;
        width: 100%;
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }

    .popover-container:hover > .popover {
        transform: translateY(0);
    }

    .popover {
        transform: translateY(var(--y-offset)) scale(var(--scale));
        z-index: var(--z-index);
        border-radius: 8px;
        display: flex;
        justify-content: center;
        aspect-ratio: 2 /1;
        background-color: white;
        flex-direction: column;
        padding: var(--space-1) var(--space-4);
        border: 1px solid red;
        will-change: transform;
        transition: transform 0.15s cubic-bezier(0.455, 0.03, 0.515, 0.955);
    }

    .popover-content {
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
</style>
