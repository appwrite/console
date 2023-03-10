<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import { sdkForProject } from '$lib/stores/sdk';
    import { rule } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Pill } from '$lib/elements';

    let isTouched = false;
    export let isVerifying = false;
    export let isVerified = false;

    const verifyDomain = async () => {
        isTouched = true;
        try {
            isVerifying = true;
            const newRule = await sdkForProject.proxy.updateRuleVerification($rule.$id);
            $rule = newRule;
            isVerified = true;
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
        {:else if isTouched}
            <Pill danger>
                <span
                    class="icon-exclamation-circle"
                    style="font-size: var(--icon-size-small);" />failed
            </Pill>
        {/if}

        <Button secondary disabled={isVerified || isVerifying} on:click={verifyDomain}
            >Verify</Button>
        <p class="u-stretch">Domain is pending verification</p>
    {/if}
</div>
