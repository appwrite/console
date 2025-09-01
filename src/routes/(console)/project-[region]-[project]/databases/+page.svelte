<script lang="ts">
    import View from './view.svelte';
    export let data;
import { base } from "\$app/paths";
import { page } from "\$app/state";
</script>

<View
    databases={data.databases}
    tables={data.tables}
    policies={data.policies}
    lastBackups={data.lastBackups}
    limit={data.limit}
    offset={data.offset}
    view={data.view}
    search={data.search}
    clearSearchHref={`${base}/project-${page.params.region}-${page.params.project}/databases`}
/>
