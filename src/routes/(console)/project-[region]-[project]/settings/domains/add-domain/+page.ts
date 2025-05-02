import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { RuleTrigger, RuleType } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants.js';

export const load = async ({ depends }) => {
    depends(Dependencies.DOMAINS);

    const [rules] = await Promise.all([
        sdk
            .forProject(page.params.region, page.params.project)
            .proxy.listRules([
                Query.equal('type', RuleType.API),
                Query.equal('trigger', RuleTrigger.MANUAL)
            ])
    ]);

    return {
        rules
    };
};
