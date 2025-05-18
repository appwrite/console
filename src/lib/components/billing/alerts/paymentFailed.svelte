<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { failedInvoice } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';

    $: isOnProjects = page.route.id.includes('project-[region]-[project]');
</script>

{#if $failedInvoice && $failedInvoice.teamId === $organization.$id && isOnProjects}
    <HeaderAlert type="error" title="A scheduled payment for {$organization.name} failed">
        To avoid service disruptions in your projects, please verify your payment details and try
        again.
        <svelte:fragment slot="buttons">
            <Button
                href={`${base}/organization-${$organization?.$id}/billing`}
                secondary
                fullWidthMobile>
                <span class="text">Go to billing</span>
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
