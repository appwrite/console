<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { upgradeURL } from '$lib/stores/billing';
</script>

<div class="u-flex-vertical u-gap-16">
    <p>Additional CPU and RAM are available for Pro and Scale teams.</p>
    <div class="u-flex u-gap-8 u-cross-center">
        <a
            class="u-bold u-block"
            target="_blank"
            rel="noopener noreferrer"
            href="https://appwrite.io/docs/advanced/platform/gb-hours">Learn more</a>
        <Button href={$upgradeURL} secondary fullWidthMobile event={'specifications_cta_upgrade'}>
            <span class="text">Upgrade Plan</span>
        </Button>
    </div>
</div>

<style>
    a {
        flex-grow: 1;
    }
</style>
