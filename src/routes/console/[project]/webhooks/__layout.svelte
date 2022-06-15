<script>
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';

    title.set('Webhooks');
    backButton.set('');

    copyData.set({
        text: '',
        value: ''
    });
    tabs.set([]);
</script>

<slot />
