import Analytics, { type AnalyticsPlugin } from 'analytics';
import Plausible from 'plausible-tracker';
import { get } from 'svelte/store';
import { page } from '$app/stores';
import { user } from '$lib/stores/user';
import { ENV, MODE, VARS, isCloud } from '$lib/system';
import { AppwriteException } from '@appwrite.io/console';
import { browser } from '$app/environment';
import { getReferrerAndUtmSource } from '$lib/helpers/utm';

function plausible(domain: string): AnalyticsPlugin {
    if (!browser) return { name: 'analytics-plugin-plausible' };

    const instance = Plausible({
        domain
    });

    return {
        name: 'analytics-plugin-plausible',
        page: ({ payload }) => {
            instance.trackPageview({
                url: payload.properties.path,
                referrer: payload.properties.referrer,
                deviceWidth: payload.properties.width
            });
        },
        track: ({ payload }) => {
            instance.trackEvent(
                payload.event,
                {
                    props: payload.properties
                },
                {
                    url: payload.properties.path,
                    deviceWidth: payload.properties.width
                }
            );
        },
        loaded: () => true
    };
}

const PLAUSIBLE_DOMAINS = {
    CLOUD: 'cloud.appwrite.io',
    GLOBAL: 'console.appwrite',
    SELF_HOSTED: 'self-hosted.appwrite'
};

const analytics = Analytics({
    app: 'appwrite',
    plugins: [plausible(isCloud ? PLAUSIBLE_DOMAINS.CLOUD : PLAUSIBLE_DOMAINS.SELF_HOSTED)]
});

export function trackEvent(name: string, data: object = null): void {
    if (!isTrackingAllowed()) {
        return;
    }

    const currentPage = get(page);
    const path = currentPage.route.id;

    if (currentPage.params?.project) {
        data = {
            ...data,
            project: currentPage.params.project
        };
    }

    data = { ...data, ...getReferrerAndUtmSource() };

    if (ENV.DEV || ENV.PREVIEW) {
        console.debug(`[Analytics] Event ${name} ${path}`, data);
    } else {
        analytics.track(name, { ...data, path });
        sendEventToGrowth(name, path, data);
    }
}

export function trackError(exception: Error, event: Submit): void {
    if (exception instanceof AppwriteException && exception.type) {
        trackEvent(Submit.Error, {
            type: exception.type,
            form: event
        });
    }
}

export function trackPageView(path: string) {
    if (!isTrackingAllowed()) {
        return;
    }

    if (ENV.DEV || ENV.PREVIEW) {
        console.debug(`[Analytics] Pageview ${path}`);
    } else {
        analytics.page({
            path
        });
    }
}

function sendEventToGrowth(event: string, path: string, data: object = null): void {
    if (!VARS.GROWTH_ENDPOINT) return;
    const userStore = get(user);
    let email: string, name: string;
    if (userStore) {
        email = userStore.email;
        name = userStore.name;
    }
    fetch(`${VARS.GROWTH_ENDPOINT}/analytics`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: event,
            label: event,
            url: window.location.origin + path,
            account: MODE,
            data: {
                email,
                name,
                ...data
            }
        })
    });
}

export function isTrackingAllowed() {
    if (ENV.TEST) {
        return;
    }
    if (window.navigator?.doNotTrack) {
        if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

export enum Submit {
    DownloadDPA = 'submit_download_dpa',
    Error = 'submit_error',
    AccountCreate = 'submit_account_create',
    AccountLogin = 'submit_account_login',
    AccountLogout = 'submit_account_logout',
    AccountRecover = 'submit_account_recover',
    AccountUpdateName = 'submit_account_update_name',
    AccountUpdateEmail = 'submit_account_update_email',
    AccountUpdatePassword = 'submit_account_update_password',
    AccountDelete = 'submit_account_delete',
    AccountDeleteSession = 'submit_account_delete_session',
    AccountDeleteAllSessions = 'submit_account_delete_all_sessions',
    AccountUpdateMfa = 'submit_account_update_mfa',
    AccountAuthenticatorCreate = 'submit_account_authenticator_create',
    AccountAuthenticatorUpdate = 'submit_account_authenticator_update',
    AccountAuthenticatorDelete = 'submit_account_authenticator_delete',
    AccountRecoveryCodesCreate = 'submit_account_recovery_codes_create',
    AccountRecoveryCodesUpdate = 'submit_account_recovery_codes_update',
    AccountDeleteIdentity = 'submit_account_delete_identity',
    UserCreate = 'submit_user_create',
    UserDelete = 'submit_user_delete',
    UserUpdateEmail = 'submit_user_update_email',
    UserUpdateLabels = 'submit_user_update_labels',
    UserUpdateName = 'submit_user_update_name',
    UserUpdatePassword = 'submit_user_update_password',
    UserUpdatePhone = 'submit_user_update_phone',
    UserUpdatePreferences = 'submit_user_update_preferences',
    UserUpdateStatus = 'submit_user_update_status',
    UserUpdateVerificationEmail = 'submit_user_update_verification_email',
    UserUpdateVerificationPhone = 'submit_user_update_verification_phone',
    UserIdentityDelete = 'submit_user_identity_delete',
    UserTargetCreate = 'submit_user_target_create',
    UserTargetDelete = 'submit_user_target_delete',
    UserAuthenticatorDelete = 'submit_user_authenticator_delete',
    OrganizationCreate = 'submit_organization_create',
    OrganizationDelete = 'submit_organization_delete',
    OrganizationUpdateName = 'submit_organization_update_name',
    ProjectCreate = 'submit_project_create',
    ProjectDelete = 'submit_project_delete',
    ProjectUpdateName = 'submit_project_update_name',
    ProjectUpdateTeam = 'submit_project_update_team',
    ProjectService = 'submit_project_service',
    ProjectUpdateSMTP = 'submit_project_update_smtp',
    MemberCreate = 'submit_member_create',
    MemberDelete = 'submit_member_delete',
    MembershipUpdate = 'submit_membership_update',
    MembershipUpdateStatus = 'submit_membership_update_status',
    ProviderUpdate = 'submit_provider_update',
    TeamCreate = 'submit_team_create',
    TeamDelete = 'submit_team_delete',
    TeamUpdateName = 'submit_team_update_name',
    AuthLimitUpdate = 'submit_auth_limit_update',
    AuthStatusUpdate = 'submit_auth_status_update',
    AuthPasswordHistoryUpdate = 'submit_auth_password_history_limit_update',
    AuthPasswordDictionaryUpdate = 'submit_auth_password_dictionary_update',
    AuthPersonalDataCheckUpdate = 'submit_auth_personal_data_check_update',
    AuthSessionAlertsUpdate = 'submit_auth_session_alerts_update',
    AuthMembershipPrivacyUpdate = 'submit_auth_membership_privacy_update',
    AuthMockNumbersUpdate = 'submit_auth_mock_numbers_update',
    SessionsLengthUpdate = 'submit_sessions_length_update',
    SessionsLimitUpdate = 'submit_sessions_limit_update',
    SessionDelete = 'submit_session_delete',
    SessionDeleteAll = 'submit_session_delete_all',
    DatabaseCreate = 'submit_database_create',
    DatabaseDelete = 'submit_database_delete',
    DatabaseUpdateName = 'submit_database_update_name',
    AttributeCreate = 'submit_attribute_create',
    AttributeUpdate = 'submit_attribute_update',
    AttributeDelete = 'submit_attribute_delete',
    DocumentCreate = 'submit_document_create',
    DocumentDelete = 'submit_document_delete',
    DocumentUpdate = 'submit_document_update',
    DocumentUpdatePermissions = 'submit_document_update_permissions',
    IndexCreate = 'submit_index_create',
    IndexDelete = 'submit_index_delete',
    CollectionCreate = 'submit_collection_create',
    CollectionDelete = 'submit_collection_delete',
    CollectionUpdateName = 'submit_collection_update_name',
    CollectionUpdatePermissions = 'submit_collection_update_permissions',
    CollectionUpdateSecurity = 'submit_collection_update_security',
    CollectionUpdateEnabled = 'submit_collection_update_enabled',
    CollectionUpdateDisplayNames = 'submit_collection_update_display_names',
    FunctionCreate = 'submit_function_create',
    FunctionDelete = 'submit_function_delete',
    FunctionUpdateName = 'submit_function_update_name',
    FunctionUpdatePermissions = 'submit_function_update_permissions',
    FunctionUpdateSchedule = 'submit_function_update_schedule',
    FunctionUpdateConfiguration = 'submit_function_update_configuration',
    FunctionUpdateLogging = 'submit_function_update_logging',
    FunctionUpdateTimeout = 'submit_function_update_timeout',
    FunctionUpdateEvents = 'submit_function_update_events',
    FunctionUpdateScopes = 'submit_function_key_update_scopes',
    FunctionConnectRepo = 'submit_function_connect_repo',
    FunctionDisconnectRepo = 'submit_function_disconnect_repo',
    FunctionRedeploy = 'submit_function_redeploy',
    DeploymentCreate = 'submit_deployment_create',
    DeploymentDelete = 'submit_deployment_delete',
    DeploymentUpdate = 'submit_deployment_update',
    DeploymentCancel = 'submit_deployment_cancel',
    ExecutionCreate = 'submit_execution_create',
    ExecutionDelete = 'submit_execution_delete',
    VariableCreate = 'submit_variable_create',
    VariableDelete = 'submit_variable_delete',
    VariableUpdate = 'submit_variable_update',
    VariableEditor = 'submit_variable_editor',
    KeyCreate = 'submit_key_create',
    KeyDelete = 'submit_key_delete',
    KeyUpdateName = 'submit_key_update_name',
    KeyUpdateScopes = 'submit_key_update_scopes',
    KeyUpdateExpire = 'submit_key_update_expire',
    PlatformCreate = 'submit_platform_create',
    PlatformDelete = 'submit_platform_delete',
    PlatformUpdate = 'submit_platform_update',
    DomainCreate = 'submit_domain_create',
    DomainDelete = 'submit_domain_delete',
    DomainUpdateVerification = 'submit_domain_update_verification',
    WebhookCreate = 'submit_webhook_create',
    WebhookDelete = 'submit_webhook_delete',
    WebhookUpdateSignature = 'submit_webhook_update_signature',
    WebhookUpdateUrl = 'submit_webhook_update_url',
    WebhookUpdateEvents = 'submit_webhook_update_events',
    WebhookUpdateName = 'submit_webhook_update_name',
    WebhookUpdateEnabled = 'submit_webhook_update_enabled',
    WebhookUpdateSecurity = 'submit_webhook_update_security',
    BucketCreate = 'submit_bucket_create',
    BucketDelete = 'submit_bucket_delete',
    BucketUpdateEnabled = 'submit_bucket_update_enabled',
    BucketUpdateName = 'submit_bucket_update_name',
    BucketUpdatePermissions = 'submit_bucket_update_permissions',
    BucketUpdateSecurity = 'submit_bucket_update_security',
    BucketUpdateFileSecurity = 'submit_bucket_update_file_security',
    BucketUpdateSize = 'submit_bucket_update_size',
    BucketUpdateCompression = 'submit_bucket_update_compression',
    BucketUpdateExtensions = 'submit_bucket_update_extensions',
    FileCreate = 'submit_file_create',
    FileDelete = 'submit_file_delete',
    FileUpdatePermissions = 'submit_file_update_permissions',
    BudgetCapUpdate = 'submit_budget_cap_update',
    BudgetAlertsUpdate = 'submit_budget_alert_conditions_update',
    CreditRedeem = 'submit_credit_redeem',
    PaymentMethodCreate = 'submit_payment_method_create',
    PaymentMethodUpdate = 'submit_payment_method_update',
    PaymentMethodDelete = 'submit_payment_method_delete',
    RetryPayment = 'submit_retry_payment',
    VerifyPayment = 'submit_verify_payment',
    BillingAddressCreate = 'submit_billing_address_create',
    BillingAddressUpdate = 'submit_billing_address_update',
    BillingAddressDelete = 'submit_billing_address_delete',
    OrganizationPaymentUpdate = 'submit_organization_payment_update',
    OrganizationPaymentDelete = 'submit_organization_payment_delete',
    OrganizationBackupPaymentUpdate = 'submit_organization_backup_payment_update',
    OrganizationBackupPaymentDelete = 'submit_organization_backup_payment_delete',
    OrganizationBillingAddressUpdate = 'submit_organization_billing_address_update',
    OrganizationBillingAddressDelete = 'submit_organization_billing_address_delete',
    OrganizationUpgrade = 'submit_organization_upgrade',
    OrganizationDowngrade = 'submit_organization_downgrade',
    OrganizationBillingTaxIdUpdate = 'submit_organization_billing_tax_id_update',
    SupportTicket = 'submit_support_ticket',
    InstallationCreate = 'submit_installation_create',
    InstallationDelete = 'submit_installation_delete',
    EmailChangeLocale = 'submit_email_change_locale',
    EmailResetTemplate = 'submit_email_reset_template',
    EmailUpdateInviteTemplate = 'submit_email_update_invite_template',
    EmailUpdateMagicUrlTemplate = 'submit_email_update_magic_url_template',
    EmailUpdateRecoveryTemplate = 'submit_email_update_recovery_template',
    EmailUpdateVerificationTemplate = 'submit_email_update_verification_template',
    SmsChangeLocale = 'submit_sms_change_locale',
    SmsResetTemplate = 'submit_sms_reset_template',
    SmsUpdateInviteTemplate = 'submit_sms_update_invite_template',
    SmsUpdateLoginTemplate = 'submit_sms_update_login_template',
    SmsUpdateVerificationTemplate = 'submit_sms_update_verification_template',
    MessagingProviderCreate = 'submit_messaging_provider_create',
    MessagingProviderDelete = 'submit_messaging_provider_delete',
    MessagingProviderUpdate = 'submit_messaging_provider_update',
    MessagingMessageCreate = 'submit_messaging_message_create',
    MessagingMessageUpdate = 'submit_messaging_message_update',
    MessagingMessageDelete = 'submit_messaging_message_delete',
    MessagingTopicCreate = 'submit_messaging_topic_create',
    MessagingTopicDelete = 'submit_messaging_topic_delete',
    MessagingTopicUpdateName = 'submit_messaging_topic_update_name',
    MessagingTopicUpdatePermissions = 'submit_messaging_topic_update_permissions',
    MessagingTopicSubscriberAdd = 'submit_messaging_topic_subscriber_add',
    MessagingTopicSubscriberDelete = 'submit_messaging_topic_subscriber_delete',
    ApplyQuickFilter = 'submit_apply_quick_filter',
    RequestBAA = 'submit_request_baa',
    RequestSoc2 = 'submit_request_soc2'
}
