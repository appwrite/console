import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { ProjectPolicyId, type Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.PROJECT);

    const projectSdk = sdk.forProject(params.region, params.project).project;
    const [
        membershipPrivacyPolicy,
        passwordDictionaryPolicy,
        passwordHistoryPolicy,
        passwordPersonalDataPolicy,
        sessionAlertPolicy,
        sessionDurationPolicy,
        sessionInvalidationPolicy,
        sessionLimitPolicy,
        userLimitPolicy
    ] = await Promise.all([
        projectSdk.getPolicy({ policyId: ProjectPolicyId.Membershipprivacy }),
        projectSdk.getPolicy({ policyId: ProjectPolicyId.Passworddictionary }),
        projectSdk.getPolicy({ policyId: ProjectPolicyId.Passwordhistory }),
        projectSdk.getPolicy({ policyId: ProjectPolicyId.Passwordpersonaldata }),
        projectSdk.getPolicy({ policyId: ProjectPolicyId.Sessionalert }),
        projectSdk.getPolicy({ policyId: ProjectPolicyId.Sessionduration }),
        projectSdk.getPolicy({ policyId: ProjectPolicyId.Sessioninvalidation }),
        projectSdk.getPolicy({ policyId: ProjectPolicyId.Sessionlimit }),
        projectSdk.getPolicy({ policyId: ProjectPolicyId.Userlimit })
    ]);

    return {
        membershipPrivacyPolicy: membershipPrivacyPolicy as Models.PolicyMembershipPrivacy,
        passwordDictionaryPolicy: passwordDictionaryPolicy as Models.PolicyPasswordDictionary,
        passwordHistoryPolicy: passwordHistoryPolicy as Models.PolicyPasswordHistory,
        passwordPersonalDataPolicy: passwordPersonalDataPolicy as Models.PolicyPasswordPersonalData,
        sessionAlertPolicy: sessionAlertPolicy as Models.PolicySessionAlert,
        sessionDurationPolicy: sessionDurationPolicy as Models.PolicySessionDuration,
        sessionInvalidationPolicy: sessionInvalidationPolicy as Models.PolicySessionInvalidation,
        sessionLimitPolicy: sessionLimitPolicy as Models.PolicySessionLimit,
        userLimitPolicy: userLimitPolicy as Models.PolicyUserLimit
    };
};
