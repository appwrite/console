<script lang="ts">
    import { Badge, Divider, Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
    import RecordsCard from '../../recordsCard.svelte';
    import { Card } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    const backPage = `${base}/project-${$page.params.project}/sites/site-${$page.params.site}/domains`;

    async function verifyStatus() {
        try {
            domainData = await sdk.forProject.proxy.updateRuleVerification(domainData.$id);
            console.log(domainData);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Wizard title="Add custom domain" href={backPage} column columnSize="s" hideFooter>
    {#if domainData.status === 'created'}
        <RecordsCard domain={domainData}>
            <Divider />
            <Layout.Stack direction="row" justifyContent="flex-end">
                <Button secondary on:click={verifyStatus}>Verify</Button>
            </Layout.Stack>
        </RecordsCard>
    {:else if domainData.status === 'verifying'}
        <Card radius="s">
            <Layout.Stack gap="s" direction="row" alignItems="center">
                <Typography.Text variant="l-500">{domainData.domain}</Typography.Text>
                <Badge variant="secondary" type="success" content="Verified" />
                <Badge variant="secondary" content="Generating certificate...">
                    <svelte:fragment slot="start">
                        <Spinner size="s" />
                    </svelte:fragment>
                </Badge>
            </Layout.Stack>
        </Card>
    {:else if domainData.status === 'verified'}
        <Card radius="s">
            <Layout.Stack gap="s" direction="row" alignItems="center">
                <Typography.Text variant="l-500">{domainData.domain}</Typography.Text>
                <Badge variant="secondary" type="success" content="Verified" />
                <Badge variant="secondary" type="success" content="Generated certificate" />
            </Layout.Stack>
        </Card>
    {/if}
</Wizard>
