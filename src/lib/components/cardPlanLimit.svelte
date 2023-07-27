<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';

    export let service = '';
</script>

<article class="card u-grid u-cross-center u-width-full-line">
    <div class="u-flex u-flex-vertical u-gap-24 u-main-center u-cross-center">
        <p class="text u-text-center">Upgrade your plan add more {service}</p>
        <Button secondary on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
            Change plan
        </Button>
    </div>
</article>
