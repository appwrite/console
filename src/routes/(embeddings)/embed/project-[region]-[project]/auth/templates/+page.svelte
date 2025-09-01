<script lang="ts">
    import View from '$routes/(console)/project-[region]-[project]/auth/templates/view.svelte';
    export let data;
</script>

<View project={data.project} />
