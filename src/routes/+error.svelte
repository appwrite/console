<script>
    import { base } from '$app/paths';
    import { Unauthenticated } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
</script>

<Unauthenticated>
    <div class="content">
        <div class="center">
            <span>404 Page not found</span>
        </div>
        <h1>The page you're looking for doesn't exist.</h1>
        <div class="center">
            <a href={base}>
                <Button>Back to console</Button>
            </a>
        </div>
    </div>
</Unauthenticated>

<style>
    .content {
        text-align: center;
    }

    span {
        padding: var(--space-1, 2px) var(--space-3, 6px);
        border-radius: var(--border-radius-XS, 6px);
        background: rgba(0, 0, 0, 0.08);
        color: #56565c;
        text-align: center;
        font-family: var(--font-family-sansSerif, Inter), sans-serif;
        font-size: var(--font-size-S, 14px);
        font-style: normal;
        font-weight: 400;
        line-height: 140%;
        letter-spacing: -0.063px;
        display: inline-block;
    }

    h1 {
        color: #2d2d31;
        text-align: center;
        font-family: var(--font-family-sansSerif, Inter), sans-serif;
        font-size: var(--font-size-XXXL, 32px);
        font-style: normal;
        font-weight: 400;
        line-height: 140%;
        letter-spacing: -0.144px;
        margin-top: 8px;
        margin-bottom: 32px;
    }

    .center {
        display: flex;
        justify-content: center;
    }

    :global(.theme-light) span {
        background: rgba(0, 0, 0, 0.08);
        color: #56565c;
    }

    :global(.theme-light) h1 {
        color: #2d2d31;
    }

    :global(.theme-dark) span {
        background: rgba(255, 255, 255, 0.2);
        color: #c3c3c6;
    }

    :global(.theme-dark) h1 {
        color: #ededf0;
    }
</style>
