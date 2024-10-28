<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import Card from '$lib/components/card.svelte';
    import { WizardSecondaryContainer, WizardSecondaryContent } from '$lib/layout/index.js';
    import { Layout, Typography, Image } from '@appwrite.io/pink-svelte';
    import Check from './(components)/check.svelte';
    import { timeFromNow } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import Button from '$lib/elements/forms/button.svelte';

    export let data: PageData;
</script>

<WizardSecondaryContainer
    href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}`}>
    <WizardSecondaryContent>
        <Layout.Stack gap="l" direction="column" alignItems="center">
            <Check />
            <Layout.Stack gap="s" direction="column" alignItems="center">
                <Typography.Text variant="l-400">Congratulations!</Typography.Text>
                <Typography.Text variant="m-400">
                    You deployed your Site successfully.
                </Typography.Text>
            </Layout.Stack>
        </Layout.Stack>
        <Card padding="xs">
            <Layout.Stack gap="m" direction="row">
                <Image
                    width={445}
                    height={280}
                    src="https://unsplash.it/445/280"
                    alt="Screenshot" />
                <Layout.Stack justifyContent="center">
                    <Layout.Stack gap="xs">
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary"
                            >Deployed</Typography.Text>
                        <Typography.Text variant="m-400"
                            >{timeFromNow(data.deployment.$updatedAt)} ago by chenparnase</Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xs">
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary"
                            >Domains</Typography.Text>
                        <Typography.Text variant="m-400">{data.deployment.domain}</Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xl" direction="row">
                        <Layout.Stack gap="xs" inline>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary"
                                >Build time</Typography.Text>
                            <Typography.Text variant="m-400">47s</Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xs" inline>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary"
                                >Build time</Typography.Text>
                            <Typography.Text variant="m-400">47s</Typography.Text>
                        </Layout.Stack>
                    </Layout.Stack>
                    <Layout.Stack gap="xs">
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary"
                            >Source</Typography.Text>
                        <Typography.Text variant="m-400">main branch</Typography.Text>
                        <Typography.Text variant="m-400">5c20ba0 initial commit</Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
            </Layout.Stack>
        </Card>
        <!-- <Layout.Stack direction="row">
            <Card></Card>
            <Card></Card>
            <Card></Card>
        </Layout.Stack> -->
        <svelte:fragment slot="footer">
            <Button
                size="s"
                fullWidthMobile
                secondary
                href="{`${base}/project-${$page.params.project}/sites/site-${$page.params.site}`}}"
                >Close</Button>
        </svelte:fragment>
    </WizardSecondaryContent>
</WizardSecondaryContainer>
