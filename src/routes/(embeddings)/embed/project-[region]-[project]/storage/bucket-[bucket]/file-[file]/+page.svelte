<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import FilePage from '$routes/(console)/project-[region]-[project]/storage/bucket-[bucket]/file-[file]/+page.svelte';
</script>

<Layout.Stack>
    <FilePage />
    <!-- Console page uses stores provided by layout; no props needed. -->
</Layout.Stack>
