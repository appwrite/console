import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { ProjectPolicyId, type Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';

type EnabledPolicy = {
    $id: string;
    enabled: boolean;
};

const ProjectEmailPolicyId = {
    DenyAliasedEmail: 'deny-aliased-email',
    DenyDisposableEmail: 'deny-disposable-email',
    DenyFreeEmail: 'deny-free-email'
} as const;

type ProjectPolicy = Models.PolicyList['policies'][number] | EnabledPolicy;
type EmailPolicyId = (typeof ProjectEmailPolicyId)[keyof typeof ProjectEmailPolicyId];

const getDefaultEnabledPolicy = (policyId: EmailPolicyId): EnabledPolicy => ({
    $id: policyId,
    enabled: false
});

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.PROJECT);

    const { policies } = await sdk.forProject(params.region, params.project).project.listPolicies();
    const policiesById = Object.fromEntries(
        (policies as ProjectPolicy[])
            .filter((policy) => policy != null && policy.$id != null)
            .map((policy) => [policy.$id, policy])
    ) as Partial<Record<ProjectPolicyId | EmailPolicyId, ProjectPolicy>>;

    return {
        membershipPrivacyPolicy: policiesById[ProjectPolicyId.Membershipprivacy] as
            | Models.PolicyMembershipPrivacy
            | undefined,
        passwordDictionaryPolicy: policiesById[ProjectPolicyId.Passworddictionary] as
            | Models.PolicyPasswordDictionary
            | undefined,
        passwordHistoryPolicy: policiesById[ProjectPolicyId.Passwordhistory] as
            | Models.PolicyPasswordHistory
            | undefined,
        passwordPersonalDataPolicy: policiesById[ProjectPolicyId.Passwordpersonaldata] as
            | Models.PolicyPasswordPersonalData
            | undefined,
        sessionAlertPolicy: policiesById[ProjectPolicyId.Sessionalert] as
            | Models.PolicySessionAlert
            | undefined,
        sessionDurationPolicy: policiesById[ProjectPolicyId.Sessionduration] as
            | Models.PolicySessionDuration
            | undefined,
        sessionInvalidationPolicy: policiesById[ProjectPolicyId.Sessioninvalidation] as
            | Models.PolicySessionInvalidation
            | undefined,
        sessionLimitPolicy: policiesById[ProjectPolicyId.Sessionlimit] as
            | Models.PolicySessionLimit
            | undefined,
        userLimitPolicy: policiesById[ProjectPolicyId.Userlimit] as
            | Models.PolicyUserLimit
            | undefined,
        denyAliasedEmailPolicy:
            (policiesById[ProjectEmailPolicyId.DenyAliasedEmail] as EnabledPolicy) ??
            getDefaultEnabledPolicy(ProjectEmailPolicyId.DenyAliasedEmail),
        denyDisposableEmailPolicy:
            (policiesById[ProjectEmailPolicyId.DenyDisposableEmail] as EnabledPolicy) ??
            getDefaultEnabledPolicy(ProjectEmailPolicyId.DenyDisposableEmail),
        denyFreeEmailPolicy:
            (policiesById[ProjectEmailPolicyId.DenyFreeEmail] as EnabledPolicy) ??
            getDefaultEnabledPolicy(ProjectEmailPolicyId.DenyFreeEmail)
    };
};
