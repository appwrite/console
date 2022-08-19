<script lang="ts">
    import { updateLayout } from '$lib/stores/layout';

    updateLayout({
        title: 'Projects',
        level: 0
    });
</script>

<slot />
