import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { RuleTrigger, RuleType } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants.js';
import { isCloud } from '$lib/system';

export const load = async ({ depends, params }) => {
    depends(Dependencies.DOMAINS);

    const [rules, domains] = await Promise.all([
        sdk
            .forProject(params.region, params.project)
            .proxy.listRules([
                Query.equal('type', RuleType.API),
                Query.equal('trigger', RuleTrigger.MANUAL)
            ]),
        isCloud ? sdk.forConsole.domains.list() : Promise.resolve(null)
    ]);

    return {
        rules,
        domains
    };
};
