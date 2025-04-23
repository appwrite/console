<!-- Loading dots -->
<script>
    let className = '';
    export { className as class };
</script>

<div class="loading-dots {className}">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
</div>

<style>
    .loading-dots {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 0.25rem;
        padding-inline: 0.5rem;
    }

    .dot {
        width: 0.25rem;
        height: 0.25rem;
        border-radius: 50%;
        background-color: hsl(var(--p-body-text-color));
        animation: loading-dots 1s infinite ease-in-out;
    }

    .dot:nth-child(1) {
        animation-delay: 0.1s;
    }

    .dot:nth-child(2) {
        animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
        animation-delay: 0.3s;
    }

    @keyframes loading-dots {
        0% {
            transform: translateY(0.25rem);
        }
        25% {
            transform: translateY(0rem);
        }
        50%,
        100% {
            transform: translateY(0.25rem);
        }
    }
</style>
