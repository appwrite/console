import type { Client } from '@appwrite.io/console';
import type { Organization } from '../stores/organization';
import type { PaymentMethod } from '@stripe/stripe-js';

export type PaymentMethodData = {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    providerMethodId: string;
    providerUserId: string;
    expiryMonth: number;
    expiryYear: number;
    expired: boolean;
    last4: string;
    country: string;
    brand: string;
    clientSecret: string;
    failed: boolean;
};

export type PaymentList = {
    paymentMethods: PaymentMethodData[];
    total: number;
};

export type Invoice = {
    $id: string;
    $createdAt: Date;
    $updatedAt: Date;
    teamId: string;
    aggregationId: string;
    amount: number;
    currency: string;
    date: number;
    from: string;
    to: string;
    status: string;
    dueAt: string;
};

export type InvoiceList = {
    invoices: Invoice[];
    total: number;
};

export type Credit = {
    /**
     * Credit ID.
     */
    $id: string;
    /**
     * Credit creation time in ISO 8601 format.
     */
    $createdAt: string;
    /**
     * Credit update date in ISO 8601 format.
     */
    $updatedAt: string;
    /**
     * coupon ID
     */
    couponId: string;
    /**
     * ID of the User.
     */
    userId: string;
    /**
     * ID of the Team.
     */
    teamId: string;
    /**
     * Provided credit amount
     */
    credits: number;
    /**
     * Used up credit amount
     */
    creditsUsed: number;
    /**
     * Credit expiration time in ISO 8601 format.
     */
    expiration: string;
    /**
     * Status of the credit. Can be one of `disabled`, `active` or `expired`.
     */
    status: string;
};

export type CreditList = {
    credits: Credit[];
    total: number;
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
};

export type AggregationList = {
    aggregations: Aggregation[];
    total: number;
};

export type Region = {
    $id: string;
    name: string;
    disabled: boolean;
    default: boolean;
    flag: string;
};

export type RegionList = {
    regions: Region[];
    total: number;
};

export class Billing {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async createOrganization(
        organizationId: string,
        name: string,
        billingPlan: string,
        paymentMethodId: string
    ): Promise<Organization> {
        const path = `/organizations`;
        const params = {
            organizationId,
            name,
            billingPlan,
            paymentMethodId
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

    async getPlan(organizationId: string): Promise<string> {
        const path = `/organizations/${organizationId}/plan`;
        const params = {
            organizationId
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

    async updatePlan(
        organizationId: string,
        billingPlan: string,
        paymentMethodId: string
    ): Promise<Organization> {
        const path = `/organizations/${organizationId}/plan`;
        const params = {
            organizationId,
            billingPlan,
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

    async updateBudget(
        organizationId: string,
        budget: number,
        alert: number[]
    ): Promise<Organization> {
        const path = `/organizations/${organizationId}/budget`;
        const params = {
            organizationId,
            budget,
            alert
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

    async listInvoices(
        organizationId: string,
        queries: string[] = [],
        search = ''
    ): Promise<InvoiceList> {
        const path = `/organizations/${organizationId}/invoices`;
        const params = {
            organizationId,
            queries,
            search
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

    async getInvoice(organizationId: string, invoiceId: string): Promise<Invoice> {
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

    async getInvoiceView(organizationId: string, invoiceId: string): Promise<URL> {
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
                'content-type': 'application/json'
            },
            params
        );
    }

    async downloadInvoice(organizationId: string, invoiceId: string): Promise<URL> {
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

    async listUsage(organizationId: string, queries: string[] = []): Promise<AggregationList> {
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

    async getUsage(organizationId: string, aggregationId: string): Promise<Aggregation> {
        const path = `/organizations/${organizationId}/aggregations/${aggregationId}`;
        const params = {
            organizationId,
            aggregationId
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

    //ACCOUNT

    async listPaymentMethods(queries: [] = []): Promise<PaymentList> {
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

    async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethodData> {
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

    async createPaymentMethod(): Promise<PaymentMethodData> {
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
    async updatePaymentMethod(
        paymentMethodId: string,
        providerMethodId: string | PaymentMethod
    ): Promise<PaymentMethodData> {
        const path = `/account/payment-methods/${paymentMethodId}`;
        const params = {
            paymentMethodId,
            providerMethodId
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

    async deletePaymentMethod(paymentMethodId: string): Promise<PaymentMethodData> {
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
    async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethodData> {
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

    async addCredit(organizationId: string, couponId: string): Promise<Credit> {
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
    async listCredits(organizationId: string, queries = []): Promise<CreditList> {
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

    async getCredit(organizationId: string, creditId: string): Promise<Credit> {
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

    async listRegions(): Promise<RegionList> {
        const path = `/console/regions`;
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
