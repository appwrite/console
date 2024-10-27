<script lang="ts">
    import Card from '$lib/components/card.svelte';
    import { Button, InputText } from '$lib/elements/forms';
    import { debounce } from '$lib/helpers/debounce';
    import { sdk } from '$lib/stores/sdk';
    import { Fieldset, Layout, Divider, Status } from '@appwrite.io/pink-svelte';

    export let domain: string;
    const orginalDomain = domain.split('').join('');
    let showConfig = false;
    let domainSuccess = true;

    async function checkDomain(domain: string) {
        const check = await sdk.forProject.proxy.checkSubdomain('site', domain);
        console.log(check);
    }

    $: if (domain) {
        console.log('test');
        checkDomain(domain);
        debounce(() => checkDomain(domain), 500);
    }
</script>

{#if showConfig}
    <Fieldset legend="Domains">
        <Layout.Stack>
            <Layout.Stack gap="xs">
                <InputText id="domain" placeholder="my-domain" bind:value={domain} />
                <Status status={domainSuccess ? 'success' : 'failed'} />
            </Layout.Stack>
            <Divider />
            <Layout.Stack direction="row" justifyContent="flex-end" gap="s">
                <Button
                    text
                    on:click={() => {
                        domain = orginalDomain;
                        showConfig = false;
                    }}>Cancel</Button>
                <Button
                    secondary
                    disabled={domainStatus !== 'success'}
                    on:click={() => (showConfig = false)}>Update</Button>
            </Layout.Stack>
        </Layout.Stack>
    </Fieldset>
{:else}
    <Card isTile>
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <p>
                <span class="icon-globe-alt"></span>
                {domain}.appwrite.global
            </p>
            <Button
                secondary
                on:click={() => {
                    showConfig = true;
                }}>
                Change
            </Button>
        </Layout.Stack>
    </Card>
{/if}
