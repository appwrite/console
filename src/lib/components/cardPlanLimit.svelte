<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { getChangePlanUrl } from '$lib/stores/billing';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { organization } from '$lib/stores/organization';
    import { project } from '$routes/(console)/project-[region]-[project]/store';

    const {
        service
    }: {
        service: string;
    } = $props();

    const organizationId: string | null = $derived.by(() => {
        return $project.teamId ?? $organization.$id;
    });
</script>

<article class="card u-grid u-cross-center u-width-full-line">
    <div class="u-flex u-flex-vertical u-gap-24 u-main-center u-cross-center">
        <p class="text u-text-center">Upgrade your plan to add more {service}</p>
        <Button
            secondary
            href={getChangePlanUrl(organizationId)}
            on:click={() => {
                trackEvent(Click.OrganizationClickUpgrade, { source: 'card_plan_limit' });
            }}>Change plan</Button>
    </div>
</article>
