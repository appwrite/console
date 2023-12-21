<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
</script>

<HeaderAlert title="You are limited to one free organization per account">
    All but one organization will be automatically upgraded to a Pro plan on <b>31 January 2024</b>.
    You can add a payment method or transfer projects from your settings.

    <svelte:fragment slot="buttons">
        <Button secondary href="/console/account/organizations">View organizations</Button>
    </svelte:fragment>
</HeaderAlert>
