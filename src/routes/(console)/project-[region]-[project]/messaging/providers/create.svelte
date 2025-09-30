<script lang="ts">
    import Provider from './wizard/provider.svelte';
    import Settings from './wizard/settings.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { project } from '../../store';
    import { wizard } from '$lib/stores/wizard';
    import { provider, providerParams, providerType } from './wizard/store';
    import { ID, MessagingProviderType, type Models } from '@appwrite.io/console';
    import { getProviderDisplayNameAndIcon, Providers } from '../provider.svelte';
    import { page } from '$app/state';
    import { Button, Form } from '$lib/elements/forms';
    import { ActionList, Card, Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { IconBookOpen, IconInfo, IconUserGroup } from '@appwrite.io/pink-icons-svelte';
    import { newMemberModal } from '$lib/stores/organization';
    import { getProviderText } from '../helper';
    import { providers } from './store';
    import CreateMember from '$routes/(console)/organization-[organization]/createMember.svelte';

    let formRef: any;

    async function create() {
        try {
            let response: Models.Provider;
            const providerId = $providerParams[$provider].providerId || ID.unique();
            switch ($provider) {
                case Providers.Twilio:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createTwilioProvider({
                            providerId,
                            name: $providerParams[$provider].name,
                            from: $providerParams[$provider].from,
                            accountSid: $providerParams[$provider].accountSid,
                            authToken: $providerParams[$provider].authToken,
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
                case Providers.Msg91:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createMsg91Provider({
                            providerId,
                            name: $providerParams[$provider].name,
                            templateId: $providerParams[$provider].templateId,
                            senderId: $providerParams[$provider].senderId,
                            authKey: $providerParams[$provider].authKey,
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
                case Providers.Telesign:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createTelesignProvider({
                            providerId,
                            name: $providerParams[$provider].name,
                            from: $providerParams[$provider].from,
                            customerId: $providerParams[$provider].customerId,
                            apiKey: $providerParams[$provider].apiKey,
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
                case Providers.Textmagic:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createTextmagicProvider({
                            providerId,
                            name: $providerParams[$provider].name,
                            from: $providerParams[$provider].from,
                            username: $providerParams[$provider].username,
                            apiKey: $providerParams[$provider].apiKey,
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
                case Providers.Vonage:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createVonageProvider({
                            providerId,
                            name: $providerParams[$provider].name,
                            from: $providerParams[$provider].from,
                            apiKey: $providerParams[$provider].apiKey,
                            apiSecret: $providerParams[$provider].apiSecret,
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
                case Providers.Mailgun:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createMailgunProvider({
                            providerId,
                            name: $providerParams[$provider].name,
                            apiKey: $providerParams[$provider].apiKey,
                            domain: $providerParams[$provider].domain,
                            isEuRegion: $providerParams[$provider].isEuRegion,
                            fromName: $providerParams[$provider].fromName || undefined,
                            fromEmail: $providerParams[$provider].fromEmail,
                            replyToName: $providerParams[$provider].replyToName || undefined,
                            replyToEmail: $providerParams[$provider].replyToEmail || undefined,
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
                case Providers.Sendgrid:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createSendgridProvider({
                            providerId,
                            name: $providerParams[$provider].name,
                            apiKey: $providerParams[$provider].apiKey,
                            fromName: $providerParams[$provider].fromName || undefined,
                            fromEmail: $providerParams[$provider].fromEmail,
                            replyToName: $providerParams[$provider].replyToName || undefined,
                            replyToEmail: $providerParams[$provider].replyToEmail || undefined,
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
                case Providers.SMTP:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createSMTPProvider({
                            providerId,
                            name: $providerParams[$provider].name,
                            host: $providerParams[$provider].host,
                            port: $providerParams[$provider].port || undefined,
                            username: $providerParams[$provider].username || undefined,
                            password: $providerParams[$provider].password || undefined,
                            encryption: $providerParams[$provider].encryption,
                            autoTLS: $providerParams[$provider].autoTLS,
                            mailer: $providerParams[$provider].mailer || undefined,
                            fromName: $providerParams[$provider].fromName || undefined,
                            fromEmail: $providerParams[$provider].fromEmail,
                            replyToName: $providerParams[$provider].replyToName || undefined,
                            replyToEmail: $providerParams[$provider].replyToEmail || undefined,
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
                case Providers.FCM:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createFCMProvider({
                            providerId,
                            name: $providerParams[$provider].name,
                            serviceAccountJSON: JSON.parse(
                                $providerParams[$provider].serviceAccountJSON
                            ),
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
                case Providers.APNS:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createAPNSProvider({
                            providerId,
                            name: $providerParams[$provider].name,
                            authKey: $providerParams[$provider].authKey,
                            authKeyId: $providerParams[$provider].authKeyId,
                            teamId: $providerParams[$provider].teamId,
                            bundleId: $providerParams[$provider].bundleId,
                            sandbox: $providerParams[$provider].sandbox,
                            enabled: $providerParams[$provider].enabled
                        });
                    break;
            }
            wizard.hide();
            addNotification({
                type: 'success',
                message: `${response.name} has been created`
            });
            trackEvent(Submit.MessagingProviderCreate, {
                provider: $provider
            });
            await goto(
                `${base}/project-${$project.region}-${$project.$id}/messaging/providers/provider-${response.$id}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingProviderCreate);
        }
    }
</script>

<Wizard title="Create provider" columnSize="l">
    <Form bind:this={formRef} onSubmit={create} isModal={false}>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Provider">
                <Provider />
            </Fieldset>
            <Fieldset legend="Settings">
                <Settings />
            </Fieldset>
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Card.Base padding="s">
            <Layout.Stack gap="s">
                <Typography.Text variant="m-500">Need a hand?</Typography.Text>
                <ActionList.Root>
                    {#if providers[$providerType].providers[$provider].needAHand}
                        {@const needAHand = providers[$providerType].providers[$provider].needAHand}
                        <ActionList.Item.Accordion
                            hasDivider
                            title={`How to enable ${getProviderText($provider)} ${
                                $providerType === MessagingProviderType.Push ||
                                $providerType === MessagingProviderType.Sms
                                    ? `${getProviderDisplayNameAndIcon($provider).displayName} notifications`
                                    : getProviderText($provider)
                            }?`}
                            icon={IconInfo}>
                            <Layout.Stack>
                                {#each needAHand as p}
                                    <p>
                                        {@html p}
                                    </p>
                                {/each}
                            </Layout.Stack>
                        </ActionList.Item.Accordion>
                    {/if}
                    <ActionList.Item.Anchor
                        hasDivider
                        href={`https://appwrite.io/docs/products/messaging/${$provider}`}
                        title="Read the guide in the docs"
                        icon={IconBookOpen}
                        target="_blank"
                        rel="noreferrer" />
                    <ActionList.Item.Button
                        on:click={() => {
                            $newMemberModal = true;
                        }}
                        title="Invite a team member"
                        icon={IconUserGroup} />
                </ActionList.Root>
            </Layout.Stack>
        </Card.Base>
    </svelte:fragment>
    {#if $newMemberModal}
        <CreateMember bind:showCreate={$newMemberModal} />
    {/if}
    <svelte:fragment slot="footer">
        <Layout.Stack justifyContent="flex-end" direction="row">
            <Button on:click={() => formRef.triggerSubmit()}>Create</Button>
        </Layout.Stack>
    </svelte:fragment>
</Wizard>
