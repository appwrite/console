<script>
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';

    title.set('API Keys');
    backButton.set('');
    tabs.set([]);

    copyData.set({
        text: '',
        value: ''
    });
</script>

<slot />
