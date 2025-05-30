<script context="module" lang="ts">
    import type {
        SmsTemplateLocale,
        SmsTemplateType,
        EmailTemplateType,
        EmailTemplateLocale
    } from '@appwrite.io/console';

    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';

    export async function loadEmailTemplate(projectId: string, type: string, locale: string) {
        try {
            // TODO: fix TemplateType and TemplateLocale typing once SDK is updated
            return await sdk.forConsole.projects.getEmailTemplate(
                projectId,
                type as EmailTemplateType,
                locale as EmailTemplateLocale
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }
    export async function loadSmsTemplate(projectId: string, type: string, locale: string) {
        try {
            // TODO: fix TemplateType and TemplateLocale typing once SDK is updated
            return await sdk.forConsole.projects.getSmsTemplate(
                projectId,
                type as SmsTemplateType,
                locale as SmsTemplateLocale
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid } from '$lib/components';
    import { Container } from '$lib/layout';
    import { baseEmailTemplate, emailTemplate, templates } from './store';
    import { Button } from '$lib/elements/forms';
    import { currentPlan } from '$lib/stores/organization';
    import EmailSignature from './emailSignature.svelte';
    import { isCloud } from '$lib/system';
    import { Accordion, Alert, Badge, Layout, Link, Typography } from '@appwrite.io/pink-svelte';
    import { page } from '$app/state';

    export let data;

    let templateType = null;
    let isTemplateLoading = false;
    let openStates = Object.fromEntries(templates.map(({ key }) => [key, false]));

    loadTemplateFor('verification');

    async function loadTemplateFor(type: string) {
        // return, already loaded!
        if (templateType === type) return;

        templateType = type;
        isTemplateLoading = true;

        $emailTemplate = await loadEmailTemplate(page.params.project, type, 'en');
        $baseEmailTemplate = { ...$emailTemplate };

        isTemplateLoading = false;
    }

    function toggleAccordion(type: string) {
        for (const key in openStates) {
            openStates[key] = false;
        }

        openStates[type] = true;

        loadTemplateFor(type);
    }
</script>

<Container>
    {#if !data.project.smtpEnabled}
        <Alert.Inline
            dismissible={false}
            status="info"
            title="Custom SMTP server is required for customizing emails">
            Configure a custom SMTP server to enable custom email templates and prevent emails from
            being labeled as spam.
            <Button
                compact
                slot="actions"
                href={`${base}/project-${page.params.region}-${page.params.project}/settings/smtp`}>
                SMTP settings
            </Button>
        </Alert.Inline>
    {/if}

    <CardGrid>
        <svelte:fragment slot="title">
            Email templates <Badge variant="secondary" content="Experimental" />
        </svelte:fragment>
        Use templates to send and process account management emails.
        <Link.Anchor
            target="_blank"
            href="https://appwrite.io/docs/advanced/platform/message-templates">
            Learn more
        </Link.Anchor>
        <svelte:fragment slot="aside">
            <Layout.Stack gap="s">
                {#each templates as section (section.key)}
                    <Accordion
                        title={section.title}
                        hideDivider={section.hideDivider}
                        bind:open={openStates[section.key]}
                        on:toggle={(event) => event.detail && toggleAccordion(section.key)}>
                        <Layout.Stack>
                            <Typography.Text>{section.description}</Typography.Text>
                            <svelte:component
                                this={section.component}
                                loading={isTemplateLoading} />
                        </Layout.Stack>
                    </Accordion>
                {/each}
            </Layout.Stack>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button
                href={`${base}/project-${page.params.region}-${page.params.project}/settings/smtp`}
                secondary>
                SMTP settings
            </Button>
        </svelte:fragment>
    </CardGrid>
    {#if isCloud && $currentPlan.emailBranding}
        <EmailSignature />
    {/if}
</Container>
