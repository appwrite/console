<script lang="ts">
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import { ProxyRulesPage } from '$lib/pages/domains';
    import { Dependencies } from '$lib/constants';

    export let data: PageData;
</script>

<Container>
    <ProxyRulesPage search={data.search} rules={data.rules} dependency={Dependencies.DOMAINS}>
        <svelte:fragment slot="heading">Custom domains</svelte:fragment>
    </ProxyRulesPage>
</Container>
