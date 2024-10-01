<script lang="ts">
    import { Button } from '$lib/elements/forms';

    export let isFlex = true;
    export let title: string;

    export let buttonText: string = null;
    export let buttonMethod: () => void = null;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();
    export let buttonDisabled = false;
    export let buttonType: 'primary' | 'secondary' | 'text' = 'primary';
</script>

<header class:u-flex={isFlex} class="u-gap-12 common-section u-main-space-between u-flex-wrap">
    <div
        class="u-flex u-cross-child-center u-cross-center u-gap-16"
        class:is-disabled={buttonDisabled}>
        <div class="body-text-1 u-bold backups-title">{title}</div>
    </div>

    <Button
        event={buttonEvent}
        on:click={buttonMethod}
        disabled={buttonDisabled}
        text={buttonType === 'text'}
        secondary={buttonType === 'secondary'}>
        <span class="icon-plus" aria-hidden="true" />
        {buttonText}
    </Button>
</header>

<style>
    :global(.theme-light) .backups-title {
        --p-body-text-color: #373b4d;
        color: var(--p-body-text-color);
    }

    :global(.theme-dark) .backups-title {
        color: hsl(var(--color-neutral-5));
    }

    :global(.small-radius-border-button) {
        border-radius: var(--border-radius-small) !important;
    }
</style>
