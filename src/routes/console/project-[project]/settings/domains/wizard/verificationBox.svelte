<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { domain } from './store';
    import { project } from '../../../store';
    import { addNotification } from '$lib/stores/notifications';

    const projectId = $project.$id;

    export let isVerifying = false;
    export let isVerified = false;

    const verifyDomain = async () => {
        isVerifying = true;
        try {
            const result = await sdkForConsole.projects.updateDomainVerification(
                projectId,
                $domain.id
            );
            isVerified = result.verification;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        } finally {
            isVerifying = false;
        }
    };
</script>

<div class="box u-flex u-gap-16 u-cross-center">
    {#if isVerifying}
        <div
            class="loader"
            style="color: hsl(var(--color-neutral-50)); inline-size: 1.25rem; block-size: 1.25rem" />
    {:else}
        <span
            class:u-hide={isVerifying}
            class:icon-x={!isVerified}
            class:icon-check={isVerified}
            aria-hidden="true"
            style="color: hsl(var(--color-neutral-50))" />
    {/if}
    <p class="u-stretch">
        {!isVerified ? 'Domain is pending verification' : 'Verified domain'}
    </p>
    {#if !isVerifying && !isVerified}
        <Button secondary on:click={verifyDomain}>Verify</Button>
    {/if}
</div>
