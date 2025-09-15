<script lang="ts">
    import BucketSettingsPage from '$routes/(console)/project-[region]-[project]/storage/bucket-[bucket]/settings/+page.svelte';
    let { data } = $props();
</script>

<BucketSettingsPage data={data as any} />

