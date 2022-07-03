<script>
    import { afterNavigate } from '$app/navigation';

    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { onMount } from 'svelte';

    const path = 'settings';

    onMount(handle);
    afterNavigate(handle);

    function handle() {
        title.set('Settings');
        backButton.set('');

        copyData.set({
            text: '',
            value: ''
        });
        tabs.set([
            {
                href: path,
                title: 'Overview'
            },
            {
                href: `${path}/services`,
                title: 'Services'
            },
            {
                href: `${path}/domains`,
                title: 'Custom Domains'
            },
            {
                href: `${path}/members`,
                title: 'Members'
            }
        ]);
    }
</script>

<svelte:head>
    <title>Appwrite - Settings</title>
</svelte:head>

<slot />
