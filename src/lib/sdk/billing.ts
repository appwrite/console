import type { Client, Models } from '@appwrite.io/console';
import type { OrganizationError } from '../stores/organization';

export type AllowedRegions =
    | 'fra'
    | 'nyc'
    | 'sfo'
    | 'blr'
    | 'lon'
    | 'ams'
    | 'sgp'
    | 'tor'
    | 'syd'
    | 'default'; //TODO: remove after migration

export type BillingPlansMap = Map<string, Models.BillingPlan>;

export class Billing {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async createOrganization(
        organizationId: string,
        name: string,
        billingPlan: string,
        paymentMethodId: string,
        billingAddressId: string = undefined,
        couponId: string = null,
        invites: Array<string> = [],
        budget: number = undefined,
        taxId: string = null
    ): Promise<Models.Organization | OrganizationError> {
        const path = `/organizations`;
        const params = {
            organizationId,
            name,
            billingPlan,
            paymentMethodId,
            billingAddressId,
            couponId,
            invites,
            budget,
            taxId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'POST',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async updatePlan(
        organizationId: string,
        billingPlan: string,
        paymentMethodId: string,
        billingAddressId: string = undefined,
        couponId: string = null,
        invites: Array<string> = [],
        budget: number = undefined,
        taxId: string = null
    ): Promise<Models.Organization | OrganizationError> {
        const path = `/organizations/${organizationId}/plan`;
        const params = {
            organizationId,
            billingPlan,
            paymentMethodId,
            billingAddressId,
            couponId,
            invites,
            budget,
            taxId
        };

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'patch',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async cancelDowngrade(
        organizationId: string
    ): Promise<Models.Organization | OrganizationError> {
        const path = `/organizations/${organizationId}/plan/cancel`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json'
        });
    }
}
