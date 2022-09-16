<script lang="ts">
    import { wizard } from '$lib/stores/wizard';

    export let title: string;

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            wizard.hide();
        }
    };
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="wizard">
    <div class="wizard-header-strip" />
    <div class="wizard-start-bg" />
    <div class="wizard-end-bg" />

    <header class="wizard-header">
        <div class="body-text-1">{title}</div>

        <slot name="header" />
        <button class="x-button" aria-label="close wizard" on:click={wizard.hide}>
            <span class="icon-x" aria-hidden="true" />
        </button>
    </header>

    <aside class="wizard-side">
        <slot name="aside" />
    </aside>
    <div class="wizard-media">
        <slot name="media" />
    </div>
    <div class="wizard-main">
        <slot />
    </div>
</section>
