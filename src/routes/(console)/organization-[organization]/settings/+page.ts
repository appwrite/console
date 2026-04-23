import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Addon, Query } from '@appwrite.io/console';
import { isCloud } from '$lib/system';

export const load: PageLoad = async ({ depends, params, parent }) => {
    const { countryList, locale } = await parent();
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.ADDONS);

    const [projects, invoices, addons, addonPrice] = await Promise.all([
        sdk.forConsole.projects.list({
            queries: [Query.equal('teamId', params.organization), Query.select(['$id', 'name'])]
        }),
        isCloud
            ? sdk.forConsole.organizations.listInvoices({
                  organizationId: params.organization
              })
            : undefined,
        isCloud
            ? sdk.forConsole.organizations
                  .listAddons({
                      organizationId: params.organization
                  })
                  .catch(() => null)
            : null,
        isCloud
            ? sdk.forConsole.organizations
                  .getAddonPrice({
                      organizationId: params.organization,
                      addon: Addon.Baa
                  })
                  .catch(() => null)
            : null
    ]);

    return {
        projects,
        invoices,
        addons,
        addonPrice,
        countryList,
        locale
    };
};
