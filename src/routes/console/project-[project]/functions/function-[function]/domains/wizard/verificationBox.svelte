<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import { sdkForProject } from '$lib/stores/sdk';
    import { rule } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { Pill } from '$lib/elements';

    const verifyDomain = async () => {
        try {
            const newRule = await sdkForProject.proxy.updateRuleVerification($rule.$id);
            $rule = newRule;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };
</script>

<div class="box u-flex u-gap-16 u-cross-center">
    {#if $rule.status === 'verified'}
        <Pill success>
            <span class="icon-check-circle" style="font-size: var(--icon-size-small);" />verified
        </Pill>
        <p class="u-stretch">Domain has been verified</p>
    {:else}
        {#if $rule.status === 'created' || $rule.status === 'verifying'}
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

        <Button
            secondary
            disabled={$rule.status === 'failed' || $rule.status === 'created'}
            on:click={verifyDomain}>Verify</Button>
        <p class="u-stretch">Domain is pending verification</p>
    {/if}
</div>
