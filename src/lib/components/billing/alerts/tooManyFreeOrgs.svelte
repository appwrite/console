<script lang="ts">
    import { HeaderAlert } from '$lib/layout';
    import { failedInvoice } from '$lib/stores/billing';
</script>

{#if $failedInvoice}
    <HeaderAlert title="You are limited to one free organization per account">
        All but one organization will be automatically upgraded to a Pro plan on <b>01 Feb 2024</b>.
        You can add a payment method or transfer projects from your settings.
    </HeaderAlert>
{/if}
