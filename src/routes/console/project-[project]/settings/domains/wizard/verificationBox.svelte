<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import { sdk, sdkForConsole } from '$lib/stores/sdk';
    import { domain } from './store';
    import { project } from '../../../store';
    import { addNotification } from '$lib/stores/notifications';
    import { Pill } from '$lib/elements';

    const projectId = $project.$id;

    export let isVerifying = false;
    export let isVerified = false;

    const verifyDomain = async () => {
        isVerifying = true;
        try {
            const result = await sdkForConsole.projects.updateDomainVerification(
                projectId,
                $domain.$id
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
    {#if isVerified}
        <Pill success>
            <span class="icon-check-circle" style="font-size: var(--icon-size-small);" />verified
        </Pill>
        <p class="u-stretch">Domain has been verified</p>
    {:else}
        {#if isVerifying}
            <div
                class="loader"
                style="color: hsl(var(--color-neutral-50)); inline-size: 1.5rem; block-size: 1.5rem" />
        {:else}
            <Pill danger>
                <span
                    class="icon-exclamation-circle"
                    style="font-size: var(--icon-size-small);" />failed
            </Pill>
        {/if}

        <p class="u-stretch">Domain is pending verification</p>
    {/if}
    {#if !isVerified}
        <Button secondary disabled={isVerifying} on:click={verifyDomain}>Verify</Button>
    {/if}
</div>
