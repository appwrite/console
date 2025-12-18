import type { Client, Models } from '@appwrite.io/console';
import type { PaymentMethod as StripePaymentMethod } from '@stripe/stripe-js';
import type { Organization, OrganizationError, OrganizationList } from '../stores/organization';

export type AggregationTeam = {
    $id: string;
    /**
     * Aggregation creation time in ISO 8601 format.
     */
    $createdAt: string;
    /**
     * Aggregation update date in ISO 8601 format.
     */
    $updatedAt: string;
    /**
     * Beginning date of the invoice.
     */
    from: string;
    /**
     * End date of the invoice.
     */
    to: string;
    /**
     * Total amount of the invoice.
     */
    amount: number;
    additionalMembers: number;

    /**
     * Price for additional members
     */
    additionalMemberAmount: number;
    /**
     * Total storage usage.
     */
    usageStorage: number;
    /**
     * Total active users for the billing period.
     */
    usageUsers: number;
    /**
     * Total number of executions for the billing period.
     */
    usageExecutions: number;
    /**
     * Total bandwidth usage for the billing period.
     */
    usageBandwidth: number;
    /**
     * Total realtime usage for the billing period.
     */
    usageRealtime: number;
    /**
     * Usage logs for the billing period.
     */
    resources: InvoiceUsage[];
    /**
     * Aggregation billing plan
     */
    plan: string;
    breakdown: AggregationBreakdown[];
};

export type AggregationBreakdown = {
    $id: string;
    name: string;
    amount: number;
    region: string;
    resources: InvoiceUsage[];
};

export type InvoiceUsage = {
    resourceId: string;
    value: number;
    amount: number;
};

export type AvailableCredit = {
    available: number;
};

export type Aggregation = {
    $id: string;
    /**
     * Aggregation creation time in ISO 8601 format.
     */
    $createdAt: string;
    /**
     * Aggregation update date in ISO 8601 format.
     */
    $updatedAt: string;
    /**
     * Beginning date of the invoice.
     */
    from: string;
    /**
     * End date of the invoice.
     */
    to: string;
    /**
     * Total amount of the invoice.
     */
    amount: number;
    additionalMembers: number;

    /**
     * Price for additional members
     */
    additionalMemberAmount: number;
    /**
     * Total storage usage.
     */
    usageStorage: number;
    /**
     * Total active users for the billing period.
     */
    usageUsers: number;
    /**
     * Total number of executions for the billing period.
     */
    usageExecutions: number;
    /**
     * Total bandwidth usage for the billing period.
     */
    usageBandwidth: number;
    /**
     * Total realtime usage for the billing period.
     */
    usageRealtime: number;
    /**
     * Usage logs for the billing period.
     */
    resources: OrganizationUsage;
    /**
     * Aggregation billing plan
     */
    plan: string;
};

export type OrganizationUsage = {
    bandwidth: Array<Models.Metric>;
    executions: Array<Models.Metric>;
    databasesReads: Array<Models.Metric>;
    databasesWrites: Array<Models.Metric>;
    imageTransformations: Array<Models.Metric>;
    executionsTotal: number;
    filesStorageTotal: number;
    buildsStorageTotal: number;
    databasesReadsTotal: number;
    databasesWritesTotal: number;
    imageTransformationsTotal: number;
    deploymentsStorageTotal: number;
    executionsMBSecondsTotal: number;
    buildsMBSecondsTotal: number;
    backupsStorageTotal: number;
    storageTotal: number;
    users: Array<Models.Metric>;
    usersTotal: number;
    projects: Array<{
        projectId: string;
        storage: number;
        executions: number;
        bandwidth: number;
        databasesReads: number;
        databasesWrites: number;
        users: number;
        authPhoneTotal: number;
        authPhoneEstimate: number;
        imageTransformations: number;
    }>;
    authPhoneTotal: number;
    authPhoneEstimate: number;
};

export type AggregationList = {
    aggregations: Aggregation[];
    total: number;
};

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

export type Address = {
    $id: string;
    streetAddress: string;
    addressLine2?: string;
    country: string;
    city: string;
    state?: string;
    postalCode: string;
    userId: string;
};

export type AddressesList = {
    billingAddresses: Address[];
    total: number;
};

export type BillingPlansMap = Map<string, Models.BillingPlan>;

export type Roles = {
    scopes: string[];
    roles: string[];
};

export class Billing {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async listOrganization(queries: string[] = []): Promise<OrganizationList> {
        const path = `/organizations`;
        const params = {
            queries
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
        billingAddressId: string = undefined,
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
    ): Promise<Models.Estimation> {
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

    async deleteOrganization(organizationId: string): Promise<Organization> {
        const path = `/organizations/${organizationId}`;
        const params = {
            organizationId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'DELETE',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async estimationDeleteOrganization(
        organizationId: string
    ): Promise<Models.EstimationDeleteOrganization> {
        const path = `/organizations/${organizationId}/estimations/delete-organization`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json'
        });
    }

    async getOrganizationPlan(organizationId: string): Promise<Models.BillingPlan> {
        const path = `/organizations/${organizationId}/plan`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('get', uri, {
            'content-type': 'application/json'
        });
    }

    async listPlans(queries: string[] = []): Promise<Models.BillingPlanList> {
        const path = `/console/plans`;
        const uri = new URL(this.client.config.endpoint + path);
        const params = {
            queries
        };
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getPlan(planId: string): Promise<Models.BillingPlan> {
        const path = `/console/plans/${planId}`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('get', uri, {
            'content-type': 'application/json'
        });
    }

    async getRoles(organizationId: string): Promise<Roles> {
        const path = `/organizations/${organizationId}/roles`;
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
    ): Promise<Models.Estimation> {
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

    async updateBudget(
        organizationId: string,
        budget: number,
        alerts: number[]
    ): Promise<Organization> {
        const path = `/organizations/${organizationId}/budget`;
        const params = {
            organizationId,
            budget,
            alerts
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

    async updateSelectedProjects(
        organizationId: string,
        projects: string[]
    ): Promise<Organization> {
        const path = `/organizations/${organizationId}/projects`;
        const params = {
            projects
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

    async setOrganizationPaymentMethod(
        organizationId: string,
        paymentMethodId: string
    ): Promise<Organization> {
        const path = `/organizations/${organizationId}/payment-method`;
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

    async setOrganizationPaymentMethodBackup(
        organizationId: string,
        paymentMethodId: string
    ): Promise<Organization> {
        const path = `/organizations/${organizationId}/payment-method/backup`;
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
    async removeOrganizationPaymentMethod(organizationId: string): Promise<Organization> {
        const path = `/organizations/${organizationId}/payment-method`;
        const params = {
            organizationId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'DELETE',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }
    async removeOrganizationPaymentMethodBackup(organizationId: string): Promise<Organization> {
        const path = `/organizations/${organizationId}/payment-method/backup`;
        const params = {
            organizationId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'DELETE',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async listInvoices(
        organizationId: string,
        queries: string[] = []
    ): Promise<Models.InvoiceList> {
        const path = `/organizations/${organizationId}/invoices`;
        const params = {
            organizationId,
            queries
        };

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getInvoice(organizationId: string, invoiceId: string): Promise<Models.Invoice> {
        const path = `/organizations/${organizationId}/invoices/${invoiceId}`;
        const params = {
            organizationId,
            invoiceId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getInvoiceView(
        organizationId: string,
        invoiceId: string
    ): Promise<Record<string, ArrayBuffer>> {
        const path = `/organizations/${organizationId}/invoices/${invoiceId}/view`;
        const params = {
            organizationId,
            invoiceId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/pdf'
            },
            params
        );
    }

    async downloadInvoice(
        organizationId: string,
        invoiceId: string
    ): Promise<Record<string, ArrayBuffer>> {
        const path = `/organizations/${organizationId}/invoices/${invoiceId}/download`;
        const params = {
            organizationId,
            invoiceId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async updateInvoiceStatus(organizationId: string, invoiceId: string): Promise<Models.Invoice> {
        const path = `/organizations/${organizationId}/invoices/${invoiceId}/status`;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call('PATCH', uri, {
            'content-type': 'application/json'
        });
    }

    async retryPayment(
        organizationId: string,
        invoiceId: string,
        paymentMethodId: string
    ): Promise<Models.Invoice> {
        const path = `/organizations/${organizationId}/invoices/${invoiceId}/payments`;
        const params = {
            organizationId,
            invoiceId,
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'post',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async listUsage(
        organizationId: string,
        startDate: string = undefined,
        endDate: string = undefined
    ): Promise<OrganizationUsage> {
        const path = `/organizations/${organizationId}/usage`;
        const params = {
            organizationId
        };

        if (startDate !== undefined) {
            params['startDate'] = startDate;
        }
        if (endDate !== undefined) {
            params['endDate'] = endDate;
        }

        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async listAggregation(
        organizationId: string,
        queries: string[] = []
    ): Promise<AggregationList> {
        const path = `/organizations/${organizationId}/aggregations`;
        const params = {
            organizationId,
            queries
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getAggregation(
        organizationId: string,
        aggregationId: string,
        limit?: number,
        offset?: number
    ): Promise<AggregationTeam> {
        const path = `/organizations/${organizationId}/aggregations/${aggregationId}`;
        const params: {
            organizationId: string;
            aggregationId: string;
            limit?: number;
            offset?: number;
        } = {
            organizationId,
            aggregationId
        };
        if (typeof limit === 'number') params.limit = limit;
        if (typeof offset === 'number') params.offset = offset;
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async addCredit(organizationId: string, couponId: string): Promise<Models.Credit> {
        const path = `/organizations/${organizationId}/credits`;
        const params = {
            couponId
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
    async listCredits(organizationId: string, queries = []): Promise<Models.CreditList> {
        const path = `/organizations/${organizationId}/credits`;
        const params = {
            queries
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getAvailableCredit(organizationId: string): Promise<AvailableCredit> {
        const path = `/organizations/${organizationId}/credits/available`;
        const params = {};
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

    async getCredit(organizationId: string, creditId: string): Promise<Models.Credit> {
        const path = `/organizations/${organizationId}/credits/${creditId}`;
        const params = {
            creditId
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

    async getCampaign(campaignId: string): Promise<Models.Campaign> {
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

    async getCouponAccount(couponId: string): Promise<Models.Coupon> {
        const path = `/account/coupons/${couponId}`;
        const params = {
            couponId
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

    async getCoupon(couponId: string): Promise<Models.Coupon> {
        const path = `/console/coupons/${couponId}`;
        const params = {
            couponId
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

    async removeBillingAddress(organizationId: string): Promise<void> {
        const path = `/organizations/${organizationId}/billing-address`;
        const params = {
            organizationId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'DELETE',
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

    async getOrganizationBillingAddress(
        organizationId: string,
        billingAddressId: string
    ): Promise<Address> {
        const path = `/organizations/${organizationId}/billing-addresses/${billingAddressId}`;
        const params = {
            organizationId,
            billingAddressId
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

    //ACCOUNT

    async listPaymentMethods(queries: [] = []): Promise<Models.PaymentMethodList> {
        const path = `/account/payment-methods`;
        const params = {
            queries
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

    async getPaymentMethod(paymentMethodId: string): Promise<Models.PaymentMethod> {
        const path = `/account/payment-methods/${paymentMethodId}`;
        const params = {
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

    async createPaymentMethod(): Promise<Models.PaymentMethod> {
        const path = `/account/payment-methods`;
        const params = {};
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

    async setPaymentMethod(
        paymentMethodId: string,
        providerMethodId: string | StripePaymentMethod,
        name: string,
        state: string | undefined = undefined
    ): Promise<Models.PaymentMethod> {
        const path = `/account/payment-methods/${paymentMethodId}/provider`;
        const params = {
            paymentMethodId,
            providerMethodId,
            name
        };

        if (state !== undefined) {
            params['state'] = state;
        }
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

    async updatePaymentMethod(
        paymentMethodId: string,
        expiryMonth: string,
        expiryYear: string
    ): Promise<Models.PaymentMethod> {
        const path = `/account/payment-methods/${paymentMethodId}`;
        const params = {
            paymentMethodId,
            expiryMonth,
            expiryYear
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

    async deletePaymentMethod(paymentMethodId: string): Promise<Models.PaymentMethod> {
        const path = `/account/payment-methods/${paymentMethodId}`;
        const params = {
            paymentMethodId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'delete',
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

    async listAddresses(queries: string[] = []): Promise<AddressesList> {
        const path = `/account/billing-addresses`;
        const params = {
            queries
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async getAddress(billingAddressId: string): Promise<Address> {
        const path = `/account/billing-addresses/${billingAddressId}`;
        const params = {
            billingAddressId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'get',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async createAddress(
        country: string,
        streetAddress: string,
        city: string,
        state: string,
        postalCode: string,
        addressLine2?: string
    ): Promise<Address> {
        const path = `/account/billing-addresses`;
        const params = {
            country,
            streetAddress,
            city,
            state,
            postalCode,
            addressLine2
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
    async updateAddress(
        billingAddressId: string,
        country: string,
        streetAddress: string,
        city: string,
        state: string,
        postalCode: string,
        addressLine2?: string
    ): Promise<Address> {
        const path = `/account/billing-addresses/${billingAddressId}`;
        const params = {
            billingAddressId,
            country,
            streetAddress,
            city,
            state,
            postalCode,
            addressLine2
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'PUT',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }
    async deleteAddress(billingAddressId: string): Promise<void> {
        const path = `/account/billing-addresses/${billingAddressId}`;
        const params = {
            billingAddressId
        };
        const uri = new URL(this.client.config.endpoint + path);
        return await this.client.call(
            'delete',
            uri,
            {
                'content-type': 'application/json'
            },
            params
        );
    }

    async listRegions(teamId: string): Promise<Models.ConsoleRegionList> {
        const path = `/console/regions`;
        const params = {
            teamId
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

    async getPlansInfo(): Promise<Models.BillingPlanList> {
        const path = `/console/plans`;
        const params = {};
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
}
