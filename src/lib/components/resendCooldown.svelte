<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount, onDestroy } from 'svelte';
    import { Link } from '@appwrite.io/pink-svelte';

    let {
        storageKey,
        seconds = 60,
        disabled = $bindable(false),
        onResend
    }: {
        storageKey: string;
        seconds?: number;
        disabled?: boolean;
        onResend: () => Promise<void> | void;
    } = $props();

    let remaining = $state(0);
    let interval: ReturnType<typeof setInterval> | null = null;

    function start(now = Date.now()) {
        const end = now + seconds * 1000;
        if (browser) {
            localStorage.setItem(`${storageKey}:end`, String(end));
        }
        tick(end);
        startTick(end);
    }

    function restore() {
        if (!browser) return;
        const raw = localStorage.getItem(`${storageKey}:end`);
        if (!raw) return;
        const end = parseInt(raw);
        const now = Date.now();
        const rem = Math.max(0, Math.ceil((end - now) / 1000));
        if (rem > 0) {
            remaining = rem;
            startTick(end);
        } else {
            localStorage.removeItem(`${storageKey}:end`);
            remaining = 0;
        }
    }

    function tick(end: number) {
        const now = Date.now();
        remaining = Math.max(0, Math.ceil((end - now) / 1000));
        if (remaining === 0 && browser) {
            localStorage.removeItem(`${storageKey}:end`);
        }
    }

    function startTick(end: number) {
        clearTick();
        interval = setInterval(() => {
            tick(end);
            if (remaining === 0) clearTick();
        }, 1000);
    }

    function clearTick() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    async function handleResend() {
        if (disabled || remaining > 0) return;
        await onResend?.();
        start();
    }

    onMount(restore);
    onDestroy(() => clearTick());
</script>

{#if remaining > 0}
    Try again in {remaining}s
{:else}
    <Link.Button on:click={handleResend} {disabled}>Resend code</Link.Button>
{/if}
