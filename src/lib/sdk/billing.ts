import type { Campaign } from '$lib/stores/campaigns';
import type { Client, Models } from '@appwrite.io/console';
import type { PaymentMethod } from '@stripe/stripe-js';
import type { Organization, OrganizationError } from '../stores/organization';

export type Estimation = {
    amount: number;
    grossAmount: number;
    credits: number;
    discount: number;
    items: EstimationItem[];
    discounts: EstimationItem[];
    trialDays: number;
    trialEndDate: string | undefined;
    error: string | undefined;
};

export type EstimationItem = {
    label: string;
    value: number;
};

export type EstimationDeleteOrganization = {
    amount: number;
    grossAmount: number;
    credits: number;
    discount: number;
    items: EstimationItem[];
    unpaidInvoices: Models.Invoice[];
};

export class Billing {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async validateOrganization(organizationId: string, invites: string[]): Promise<Organization> {
        const path = `/organizations/${organizationId}/validate`;
        const params = {
            organizationId,
            invites
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'PATCH',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async createOrganization(
        organizationId: string,
        name: string,
        billingPlan: string,
        paymentMethodId: string,
        billingAddressId: string = null,
        couponId: string = null,
        invites: Array<string> = [],
        budget: number = undefined,
        taxId: string = null
    ): Promise<Organization | OrganizationError> {
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

    async estimationCreateOrganization(
        billingPlan: string,
        couponId: string = null,
        invites: Array<string> = []
    ): Promise<Estimation> {
        const path = `/organizations/estimations/create-organization`;
        const params = {
            billingPlan,
            couponId,
            invites
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

    async estimationDeleteOrganization(
        organizationId: string
    ): Promise<EstimationDeleteOrganization> {
        const path = `/organizations/${organizationId}/estimations/delete-organization`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json'
        });
    }

    async getPlan(planId: string): Promise<Models.BillingPlan> {
        const path = `/console/plans/${planId}`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('get', uri, {
            'content-type': 'application/json'
        });
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
    ): Promise<Organization | OrganizationError> {
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

    async estimationUpdatePlan(
        organizationId: string,
        billingPlan: string,
        couponId: string = null,
        invites: Array<string> = []
    ): Promise<Estimation> {
        const path = `/organizations/${organizationId}/estimations/update-plan`;
        const params = {
            billingPlan,
            couponId,
            invites
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

    async cancelDowngrade(organizationId: string): Promise<Organization | OrganizationError> {
        const path = `/organizations/${organizationId}/plan/cancel`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json'
        });
    }

    async getCampaign(campaignId: string): Promise<Campaign> {
        const path = `/console/campaigns/${campaignId}`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('GET', uri, {
            'content-type': 'application/json'
        });
    }

    async setMembership(
        programId: string
    ): Promise<{ $createdAt: string } | { error: { code: number; message: string } }> {
        const path = `/console/programs/${programId}/memberships`;
        const uri = new URL(this.client.config.endpoint + path);
        try {
            return await this.client.call('POST', uri, {
                'content-type': 'application/json'
            });
        } catch (e) {
            return { error: { code: e.code, message: e.message } };
        }
    }

    async setBillingAddress(
        organizationId: string,
        billingAddressId: string
    ): Promise<Organization> {
        const path = `/organizations/${organizationId}/billing-address`;
        const params = {
            organizationId,
            billingAddressId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'PATCH',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async updateTaxId(organizationId: string, taxId: string): Promise<Organization> {
        const path = `/organizations/${organizationId}/taxId`;
        const params = {
            organizationId,
            taxId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'PATCH',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getOrganizationPaymentMethod(
        organizationId: string,
        paymentMethodId: string
    ): Promise<Models.PaymentMethod> {
        const path = `/organizations/${organizationId}/payment-methods/${paymentMethodId}`;
        const params = {
            organizationId,
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'GET',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async setPaymentMethod(
        paymentMethodId: string,
        providerMethodId: string | PaymentMethod,
        name: string
    ): Promise<Models.PaymentMethod> {
        const path = `/account/payment-methods/${paymentMethodId}/provider`;
        const params = {
            paymentMethodId,
            providerMethodId,
            name
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

    async setDefaultPaymentMethod(paymentMethodId: string): Promise<Models.PaymentMethod> {
        const path = `/account/payment-methods/${paymentMethodId}/default`;
        const params = {
            paymentMethodId
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

    async setupPaymentMandate(
        organizationId: string,
        paymentMethodId: string
    ): Promise<Models.PaymentMethod> {
        const path = `/account/payment-methods/${paymentMethodId}/setup`;
        const params = {
            organizationId,
            paymentMethodId
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
}
