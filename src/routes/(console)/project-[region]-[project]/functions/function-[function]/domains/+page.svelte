<script lang="ts">
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import { ProxyRulesPage } from '$lib/pages/domains';
    import { Dependencies } from '$lib/constants';
    import { ResourceType } from '@appwrite.io/console';

    export let data: PageData;
</script>

<Container>
    <ProxyRulesPage
        rules={data.rules}
        type={ResourceType.Function}
        dependency={Dependencies.FUNCTION_DOMAINS}>
        <svelte:fragment slot="heading">Domains</svelte:fragment>
    </ProxyRulesPage>
</Container>
