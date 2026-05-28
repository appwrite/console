import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { OrganizationAddon, Query } from '@appwrite.io/console';
import { isCloud } from '$lib/system';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load: PageLoad = async ({ depends, params, parent }) => {
    const { countryList, locale, roles } = await parent();

    if (isCloud && !roles.includes('owner')) {
        redirect(
            303,
            resolve('/(console)/organization-[organization]', {
                organization: params.organization
            })
        );
    }
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.ADDONS);

    const [projects, invoices, addons, addonPrice] = await Promise.all([
        sdk.forConsole.organization(params.organization).listProjects({
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
                      addon: OrganizationAddon.Baa
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
