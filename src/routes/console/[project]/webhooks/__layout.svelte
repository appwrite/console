<script>
    import { tabs, title, backButton } from '$lib/stores/layout';

    title.set('Webhooks');
    backButton.set('');
    tabs.set([]);
</script>

<slot />
