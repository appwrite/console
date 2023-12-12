<script lang="ts">
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import { ProxyRulesPage, ProxyTypes } from '$lib/pages/domains';
    import { Dependencies } from '$lib/constants';

    export let data: PageData;
</script>

<Container>
    <ProxyRulesPage rules={data.rules} type={ProxyTypes.API} dependency={Dependencies.DOMAINS}>
        <svelte:fragment slot="heading">Custom Domains</svelte:fragment>
    </ProxyRulesPage>
</Container>
