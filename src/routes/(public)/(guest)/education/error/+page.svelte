<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';

    $: message = page.url.searchParams.get('message');
    $: code = parseInt(page.url.searchParams.get('code'));

    const getErrorTitle = () => {
        if (code == 403) {
            return "It looks like you're not currently eligible for the GitHub Student Developer Pack.";
        }
        return message;
    };

    const getErrorExplanation = () => {
        if (code === 403) {
            return 'You can still sign in and explore Appwrite.';
        } else if (code === 409) {
            return "You've already registered for the education program.";
        }
        return '';
    };
</script>

<div class="content">
    <h1>{getErrorTitle()}</h1>
    <p>{getErrorExplanation()}</p>
    <Button
        fullWidth
        on:click={() => {
            location.href = `${base}/login`;
        }}>
        <span class="text">Go to sign in</span>
    </Button>
</div>

<style>
    .content {
        @media (min-width: 768px) {
            width: 460px;
        }
    }

    .content h1 {
        font-family: var(--heading-font);
        font-size: 2rem;
        line-height: 2.125rem;
        margin-top: 2.5rem;
        color: var(--heading-color);
    }

    .content p {
        margin-top: 1.25rem;
        color: var(--text-color);
        font-size: 1.125rem;
        font-weight: 500;
        line-height: 1.625rem;
        margin-bottom: 2rem;
    }
</style>
