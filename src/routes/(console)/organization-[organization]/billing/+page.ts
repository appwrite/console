import { BillingPlan, Dependencies } from '$lib/constants';
import type { Address } from '$lib/sdk/billing';
import { type Organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';
import { Query } from '@appwrite.io/console';
import type { UsageProjectInfo } from '../store';

export const load: PageLoad = async ({ parent, depends }) => {
    const { organization, scopes, currentPlan, countryList, locale } = await parent();

    if (!scopes.includes('billing.read')) {
        return redirect(301, `/console/organization-${organization.$id}`);
    }

    depends(Dependencies.PAYMENT_METHODS);
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.CREDIT);
    depends(Dependencies.INVOICES);
    depends(Dependencies.ADDRESS);

    const billingAddressId = (organization as Organization)?.billingAddressId;
    const billingAddressPromise: Promise<Address> = billingAddressId
        ? sdk.forConsole.billing
              .getOrganizationBillingAddress(organization.$id, billingAddressId)
              .catch(() => null)
        : null;

    /**
     * Needed to keep this out of Promise.all, as when organization is
     * initially created, these might return 404
     * - can be removed later once that is fixed in back-end
     */
    let billingAggregation = null;
    try {
        billingAggregation = await sdk.forConsole.billing.getAggregation(
            organization.$id,
            (organization as Organization)?.billingAggregationId
        );
    } catch (e) {
        // ignore error
    }

    let billingInvoice = null;
    try {
        billingInvoice = await sdk.forConsole.billing.getInvoice(
            organization.$id,
            (organization as Organization)?.billingInvoiceId
        );
    } catch (e) {
        // ignore error
    }

    const areCreditsSupported = isCloud
        ? (currentPlan?.supportsCredits ??
          (organization.billingPlan !== BillingPlan.FREE &&
              organization?.billingPlan !== BillingPlan.GITHUB_EDUCATION))
        : false;

    // load organization usage data and project metadata for planSummary component
    let organizationUsage = null;
    let usageProjects: Record<string, UsageProjectInfo> = {};

    try {
        organizationUsage = await sdk.forConsole.billing.listUsage(organization.$id);
    } catch (e) {
        organizationUsage = null;
    }

    try {
        const projectsResponse = await sdk.forConsole.projects.list([
            Query.equal('teamId', organization.$id),
            Query.limit(1000)
        ]);
        for (const project of projectsResponse.projects) {
            usageProjects[project.$id] = {
                name: project.name,
                region: project.region
            };
        }
    } catch (e) {
        // ignore error
    }

    const [paymentMethods, addressList, billingAddress, availableCredit] = await Promise.all([
        sdk.forConsole.billing.listPaymentMethods(),
        sdk.forConsole.billing.listAddresses(),
        billingAddressPromise,
        areCreditsSupported ? sdk.forConsole.billing.getAvailableCredit(organization.$id) : null
    ]);

    // make number
    const credits = availableCredit ? availableCredit.available : null;

    return {
        paymentMethods,
        addressList,
        billingAddress,
        availableCredit: credits,
        billingAggregation,
        billingInvoice,
        areCreditsSupported,
        countryList,
        locale,
        organizationUsage,
        usageProjects
    };
};
