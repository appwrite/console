import { BillingPlan, Dependencies } from '$lib/constants';
import type { Address } from '$lib/sdk/billing';
import { type Organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';
import { Query } from '@appwrite.io/console';
import type { UsageProjectInfo } from '../store';
import type { OrganizationUsage } from '$lib/sdk/billing';

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

    const [paymentMethods, addressList, billingAddress, availableCredit, organizationUsage] =
        await Promise.all([
            sdk.forConsole.billing.listPaymentMethods(),
            sdk.forConsole.billing.listAddresses(),
            billingAddressPromise,
            areCreditsSupported
                ? sdk.forConsole.billing.getAvailableCredit(organization.$id)
                : null,
            sdk.forConsole.billing.listUsage(
                organization.$id,
                organization.billingCurrentInvoiceDate,
                organization.billingNextInvoiceDate
            )
        ]);

    // make number
    const credits = availableCredit ? availableCredit.available : null;

    // Get project information for usage display
    const usageProjects = organizationUsage ? await getUsageProjects(organizationUsage) : {};

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

// Get project names and regions for usage display
async function getUsageProjects(
    usage: OrganizationUsage
): Promise<Record<string, UsageProjectInfo>> {
    const projects: Record<string, UsageProjectInfo> = {};
    const limit = 100;
    const requests = [];

    for (let index = 0; index < usage.projects.length; index += limit) {
        const chunkIds = usage.projects.slice(index, index + limit).map((p) => p.projectId);
        requests.push(
            sdk.forConsole.projects.list([Query.limit(limit), Query.equal('$id', chunkIds)])
        );
    }

    const responses = await Promise.all(requests);
    for (const response of responses) {
        for (const project of response.projects) {
            projects[project.$id] = {
                name: project.name,
                region: project.region
            };
        }
    }

    return projects;
}
