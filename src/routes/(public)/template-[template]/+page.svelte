<script lang="ts">
    import { base } from '$app/paths';
    import { SvgIcon } from '$lib/components/index.js';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';
    import type { Organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { getFrameworkIcon } from '$lib/stores/sites.js';
    import { OAuthProvider, Query, type Models } from '@appwrite.io/console';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Card, Divider, Icon, Image, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    export let data;

    let projects: Models.ProjectList;
    let selectedOrg: Organization = data?.organizations?.total
        ? data.organizations.teams[0]
        : undefined;
    onMount(async () => {
        if (data.organizations) {
            projects = await sdk.forConsole.projects.list([
                Query.equal('teamId', selectedOrg.$id),
                Query.orderDesc('')
            ]);
        }
    });

    export function isSiteTemplate(
        template: Models.TemplateFunction | Models.TemplateSite,
        product: 'site' | 'function'
    ): template is Models.TemplateSite {
        return product === 'site';
    }

    function onGithubLogin() {
        sdk.forConsole.account.createOAuth2Session(
            OAuthProvider.Github,
            window.location.origin,
            window.location.origin,
            ['read:user', 'user:email']
        );
    }
</script>

<svelte:head>
    <title>Deploy {data.template.name} - Appwrite</title>
</svelte:head>

<div class="auth-bg">
    <section class="console-container">
        <Card.Base padding="s" radius="l">
            <Layout.Stack gap="xl">
                <Layout.Stack gap="l">
                    <Typography.Title size="l">
                        Deploy {data.product}
                    </Typography.Title>
                    <Card.Base variant="secondary" padding="xxxs" radius="s">
                        <Layout.GridFraction start={4} end={5}>
                            {#if isSiteTemplate(data.template, data.product)}
                                {@const framework = data.template.frameworks[0]}
                                <Image
                                    border
                                    radius="s"
                                    ratio="16/9"
                                    style=" align-self: start"
                                    src={$app.themeInUse === 'dark'
                                        ? data.template.screenshotDark ||
                                          `${base}/images/sites/screenshot-placeholder-dark.svg`
                                        : data.template.screenshotLight ||
                                          `${base}/images/sites/screenshot-placeholder-light.svg`}
                                    alt="Screenshot" />
                                <Layout.Stack gap="xl">
                                    <Layout.Stack gap="xxs">
                                        <Typography.Text
                                            variant="m-500"
                                            color="--fgcolor-neutral-primary">
                                            {data.template.name}
                                        </Typography.Text>
                                        <Typography.Text variant="m-500">
                                            {data.template.tagline}
                                        </Typography.Text>
                                    </Layout.Stack>
                                    {@const frameworkIcon = getFrameworkIcon(framework.key)}
                                    <Layout.Stack gap="xxs" alignItems="center" direction="row">
                                        {#if frameworkIcon}
                                            <SvgIcon
                                                iconSize="small"
                                                size={16}
                                                name={frameworkIcon} />
                                        {/if}
                                        <Typography.Text
                                            variant="m-500"
                                            color="--fgcolor-neutral-primary">
                                            {framework.name}
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Layout.Stack>
                            {/if}
                        </Layout.GridFraction>
                    </Card.Base>

                    {#if data.account}
                        <InputSelect
                            id="organization"
                            label="Organization"
                            placeholder="Select an organization"
                            options={data.organizations.teams.map((o) => ({
                                label: o.name,
                                value: o.$id
                            }))}
                            bind:value={selectedOrg.$id} />

                        <Divider />
                        <Button secondary fullWidth on:click={onGithubLogin}>
                            <Icon slot="start" icon={IconGithub} />
                            <span class="text">Sign in with GitHub</span>
                        </Button>
                    {:else}
                        <Typography.Text variant="m-500">
                            Sign in to deploy a site from GitHub.
                        </Typography.Text>

                        <Divider />
                        <Button secondary fullWidth on:click={onGithubLogin}>
                            <Icon slot="start" icon={IconGithub} />
                            <span class="text">Sign in with GitHub</span>
                        </Button>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </Card.Base>
    </section>
    <footer>
        <Typography.Eyebrow color="--fgcolor-neutral-secondary">POWERED BY</Typography.Eyebrow>
        {#if $app.themeInUse === 'dark'}
            <img
                src="/console/images/appwrite-logo-dark.svg"
                width="120"
                height="22"
                alt="Appwrite Logo" />
        {:else}
            <img
                src="/console/images/appwrite-logo-light.svg"
                width="120"
                height="22"
                alt="Appwrite Logo" />
        {/if}
    </footer>
</div>

<style lang="scss">
    .auth-bg {
        position: fixed;
        background: var(--bgcolor-neutral-primary, #fff);
        background-size: cover;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        justify-content: space-between;
        section {
            flex: 1;
            display: flex;
            align-items: center;
            width: 100%;
            max-width: 592px;
        }
        footer {
            padding: 2rem 1rem;
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
        }
    }
</style>
