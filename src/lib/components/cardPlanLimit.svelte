<script lang="ts">
    import { base } from '$app/paths';
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';

    export let service: string;
</script>

<article class="card u-grid u-cross-center u-width-full-line">
    <div class="u-flex u-flex-vertical u-gap-24 u-main-center u-cross-center">
        <p class="text u-text-center">Upgrade your plan to add more {service}</p>
        <Button secondary href={`${base}/console/organization-${$organization.$id}/change-plan`}>
            Change plan
        </Button>
    </div>
</article>
