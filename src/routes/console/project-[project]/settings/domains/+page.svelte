<script lang="ts">
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import { ProxyRulesPage } from '$lib/pages/domains';
    import { Dependencies } from '$lib/constants';
    import { ResourceType } from '@appwrite.io/console';

    export let data: PageData;
</script>

<Container>
    <ProxyRulesPage rules={data.rules} type={ResourceType.Api} dependency={Dependencies.DOMAINS}>
        <svelte:fragment slot="heading">Custom Domains</svelte:fragment>
    </ProxyRulesPage>
</Container>
