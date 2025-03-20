<script lang="ts">
    import { IconGlobeAlt } from '@appwrite.io/pink-icons-svelte';
    import { Card, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import VerificationFieldset from './verificationFieldset.svelte';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { isCloud } from '$lib/system';
    import { page } from '$app/stores';

    let selectedTab: 'cname' | 'nameserver';

    async function back() {}

    async function addDomain() {
        const isNewDomain =
            data.domains.rules.findIndex((rule) => rule.domain === $page.params.domain) === -1;
        try {
            if (isNewDomain && isCloud) {
                domainData = await sdk.forConsole.domains.create(
                    $organization.$id,
                    $page.params.domain
                );
            }

            addNotification({
                type: 'success',
                message: 'Domain added successfully'
            });
            await goto(backPage);
            await invalidate(Dependencies.DOMAINS);
            await invalidate(Dependencies.SITES_DOMAINS);
        } catch (error) {
            await invalidate(Dependencies.DOMAINS);

            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
    $: isVerified = domainData?.nameservers
        ? domainData?.nameservers.toLocaleLowerCase() === 'appwrite'
        : undefined;
</script>

<Layout.Stack gap="xxl">
    <Card.Base radius="s" padding="s">
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center" gap="xs">
            <Layout.Stack direction="row" alignItems="center" gap="xs">
                <Icon icon={IconGlobeAlt} color="--fgcolor-neutral-primary" />

                <Typography.Text variation="m-500" color="--fgcolor-neutral-primary">
                    {$page.params.domain}
                </Typography.Text>
            </Layout.Stack>
            <Button secondary on:click={back}>Change</Button>
        </Layout.Stack>
    </Card.Base>

    <VerificationFieldset domain={$page.params.domain} verified={isVerified} bind:selectedTab />
</Layout.Stack>
