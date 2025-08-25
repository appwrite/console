<script lang="ts">
    import Provider from './wizard/provider.svelte';
    import Settings from './wizard/settings.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { goto } from '$app/navigation';
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
    import { getProjectRoute } from '$lib/helpers/project';

    async function create() {
        try {
            let response: Models.Provider;
            const providerId = $providerParams[$provider].providerId || ID.unique();
            switch ($provider) {
                case Providers.Twilio:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createTwilioProvider(
                            providerId,
                            $providerParams[$provider].name,
                            $providerParams[$provider].from,
                            $providerParams[$provider].accountSid,
                            $providerParams[$provider].authToken,
                            $providerParams[$provider].enabled
                        );
                    break;
                case Providers.Msg91:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createMsg91Provider(
                            providerId,
                            $providerParams[$provider].name,
                            $providerParams[$provider].templateId,
                            $providerParams[$provider].senderId,
                            $providerParams[$provider].authKey,
                            $providerParams[$provider].enabled
                        );
                    break;
                case Providers.Telesign:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createTelesignProvider(
                            providerId,
                            $providerParams[$provider].name,
                            $providerParams[$provider].from,
                            $providerParams[$provider].customerId,
                            $providerParams[$provider].apiKey,
                            $providerParams[$provider].enabled
                        );
                    break;
                case Providers.Textmagic:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createTextmagicProvider(
                            providerId,
                            $providerParams[$provider].name,
                            $providerParams[$provider].from,
                            $providerParams[$provider].username,
                            $providerParams[$provider].apiKey,
                            $providerParams[$provider].enabled
                        );
                    break;
                case Providers.Vonage:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createVonageProvider(
                            providerId,
                            $providerParams[$provider].name,
                            $providerParams[$provider].from,
                            $providerParams[$provider].apiKey,
                            $providerParams[$provider].apiSecret,
                            $providerParams[$provider].enabled
                        );
                    break;
                case Providers.Mailgun:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createMailgunProvider(
                            providerId,
                            $providerParams[$provider].name,
                            $providerParams[$provider].apiKey,
                            $providerParams[$provider].domain,
                            $providerParams[$provider].isEuRegion,
                            $providerParams[$provider].fromName || undefined,
                            $providerParams[$provider].fromEmail,
                            $providerParams[$provider].replyToName || undefined,
                            $providerParams[$provider].replyToEmail || undefined,
                            $providerParams[$provider].enabled
                        );
                    break;
                case Providers.Sendgrid:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createSendgridProvider(
                            providerId,
                            $providerParams[$provider].name,
                            $providerParams[$provider].apiKey,
                            $providerParams[$provider].fromName || undefined,
                            $providerParams[$provider].fromEmail,
                            $providerParams[$provider].replyToName || undefined,
                            $providerParams[$provider].replyToEmail || undefined,
                            $providerParams[$provider].enabled
                        );
                    break;
                case Providers.SMTP:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createSmtpProvider(
                            providerId,
                            $providerParams[$provider].name,
                            $providerParams[$provider].host,
                            $providerParams[$provider].port || undefined,
                            $providerParams[$provider].username || undefined,
                            $providerParams[$provider].password || undefined,
                            $providerParams[$provider].encryption,
                            $providerParams[$provider].autoTLS,
                            $providerParams[$provider].mailer || undefined,
                            $providerParams[$provider].fromName || undefined,
                            $providerParams[$provider].fromEmail,
                            $providerParams[$provider].replyToName || undefined,
                            $providerParams[$provider].replyToEmail || undefined,
                            $providerParams[$provider].enabled
                        );
                    break;
                case Providers.FCM:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createFcmProvider(
                            providerId,
                            $providerParams[$provider].name,
                            JSON.parse($providerParams[$provider].serviceAccountJSON),
                            $providerParams[$provider].enabled
                        );
                    break;
                case Providers.APNS:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.createApnsProvider(
                            providerId,
                            $providerParams[$provider].name,
                            $providerParams[$provider].authKey,
                            $providerParams[$provider].authKeyId,
                            $providerParams[$provider].teamId,
                            $providerParams[$provider].bundleId,
                            $providerParams[$provider].sandbox,
                            $providerParams[$provider].enabled
                        );
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
            await goto(getProjectRoute(`/messaging/providers/provider-${response.$id}`));
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
    <Form onSubmit={create} isModal={false}>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Provider">
                <Provider />
            </Fieldset>
            <Fieldset legend="Settings">
                <Settings />
            </Fieldset>
            <Layout.Stack justifyContent="flex-end" direction="row">
                <Button submit>Create</Button>
            </Layout.Stack>
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
                                $providerType == MessagingProviderType.Push ||
                                $providerType == MessagingProviderType.Sms
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
                        icon={IconBookOpen} />
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
</Wizard>
