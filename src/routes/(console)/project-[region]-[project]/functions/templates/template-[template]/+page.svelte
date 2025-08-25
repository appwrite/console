<script lang="ts">
    import { Card } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ContainerButton } from '$lib/layout';
    import { isCloud } from '$lib/system';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import { template } from './store';
    import { app } from '$lib/stores/app';
    import { isServiceLimited } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { functionsList } from '../../store';
    import { canWriteFunctions } from '$lib/stores/roles';
    import {
        Layout,
        Typography,
        Card as PinkCard,
        Image,
        Badge,
        Divider,
        Icon
    } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import { IconExternalLink } from '@appwrite.io/pink-icons-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    $: buttonDisabled =
        isCloud && isServiceLimited('functions', $organization?.billingPlan, $functionsList?.total);
</script>

<Container>
    <Layout.GridFraction start={1} end={3} gap="xxl">
        <div>
            <PinkCard.Base radius="s" padding="s">
                <Layout.Stack gap="s">
                    <Typography.Text color="--fgcolor-neutral-tertiary"
                        >Published by</Typography.Text>
                    <Image
                        fit="contain"
                        src={$app.themeInUse === 'dark' ? AppwriteLogoDark : AppwriteLogoLight}
                        width={120}
                        height={22}
                        alt="Appwrite" />
                </Layout.Stack>
            </PinkCard.Base>
        </div>
        <Card radius="m" padding="s">
            <Layout.Stack gap="xl">
                <Layout.Stack gap="l">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                            About
                        </Typography.Text>
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                            {$template.tagline}
                        </Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                            Use cases
                        </Typography.Text>
                        <Layout.Stack direction="row" gap="xs" wrap="wrap">
                            {#each $template.useCases as useCase}
                                <Badge variant="secondary" size="s" content={capitalize(useCase)} />
                            {/each}
                        </Layout.Stack>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                            Runtimes
                        </Typography.Text>
                        <Layout.Stack direction="row" gap="xs" wrap="wrap">
                            {#each $template.runtimes as runtime}
                                <Badge variant="secondary" size="s" content={runtime.name} />
                            {/each}
                        </Layout.Stack>
                    </Layout.Stack>
                </Layout.Stack>

                <Divider />

                <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
                    <Button
                        secondary
                        href={`https://github.com/${$template.providerOwner}/${$template.providerRepositoryId}`}
                        external>
                        View source
                        <Icon icon={IconExternalLink} size="s" slot="end" />
                    </Button>
                    {#if $canWriteFunctions}
                        <ContainerButton
                            title="functions"
                            disabled={buttonDisabled}
                            buttonHref={getProjectRoute(
                                `/functions/create-function/template-${$template.id}`
                            )}
                            showIcon={false}
                            buttonText="Create function"
                            buttonEvent="create_function" />
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </Card>
    </Layout.GridFraction>
</Container>
