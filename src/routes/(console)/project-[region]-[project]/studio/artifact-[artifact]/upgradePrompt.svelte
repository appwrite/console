<script lang="ts">
    import ImagineBg from '$lib/images/login/imagine-bg.webp';
    import type { Snippet } from 'svelte';

    type Props = {
        children: Snippet;
    };

    const { children }: Props = $props();
</script>

<div class="upgrade-prompt">
    {@render children()}

    <img src={ImagineBg} alt="Imagine background" class="background" />
</div>

<style>
    .upgrade-prompt {
        height: 40px;
        display: flex;
        align-items: center;
        position: relative;
        z-index: 1;
        width: calc(100% + 2 * var(--space-4));
        margin-inline-start: calc(-1 * var(--space-4));
        margin-block-end: calc(-1 * var(--space-2));
        background-color: #000;
        border-radius: var(--border-radius-s) var(--border-radius-s) 0 0;
        padding: var(--space-2) var(--space-6) var(--space-4);
        animation: enter 0.2s ease-in-out;
        animation-fill-mode: forwards;
        overflow: hidden;

        .background {
            width: 50%;
            position: absolute;
            object-fit: cover;
            right: 0;
            z-index: -1;
            mask-image: linear-gradient(to right, transparent, black);
        }
    }

    @keyframes enter {
        from {
            transform: translateY(8px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>
