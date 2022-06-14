<script>
    import { tabs, title, backButton } from '$lib/stores/layout';

    title.set('API Keys');
    backButton.set('');
    tabs.set([]);
</script>

<slot />
