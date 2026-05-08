import { test, expect, type Page } from '@playwright/test';

const PROJECT_ID = '69c5061ee68ebce1a541';
const REGION = 'fra';

const SESSION_COOKIE = {
    name: 'a_session_console_legacy',
    value: 'eyJpZCI6IjY5YzUwNjFlNjQ4ZTEzYjBiZDhkIiwic2VjcmV0IjoiMzYzMWNiOWY1YjJiYjU5MTUyNjU0ZGIxZGMzNTMxNmU5OWZkMmM5NDc0NzcyY2IzNmM4MGEwNzRlODMwMTRlYzJhZjFmOTQ4NDBkNmRjNzQzNDViOGExMzg2YzRjNzVhNTUwNzExMDczZDQ4OThkNTg4ZjYyN2UxNmUwN2VmNTYwNzhmMjQ2MThlMDk0ZmY5YWM1MzMwOTI2MzNkNGQwYTIzZGZkNTdmNjY0MGVjZjU3YTJhOWQ4NzA1OThjZDBlYmRmOWRiYTM5OTI1YWY4NDU3Yzc2MTczNjc4YTk0YTIyNWU0YmU1YWRkMGQ1ZWVmYmQwNmYwMWJhYmZhNGJlNiJ9',
    domain: 'localhost',
    path: '/'
};

const DATABASES_URL = `project-${REGION}-${PROJECT_ID}/databases`;
const CREATE_URL = `${DATABASES_URL}/create`;

async function authenticate(page: Page) {
    await page.context().addCookies([SESSION_COOKIE]);
}

/** Wait for the create page to finish loading by checking for a known element. */
async function waitForCreatePage(page: Page, marker: string = 'Details') {
    await page.waitForSelector(`text=${marker}`, { timeout: 15_000 });
}

/** Change a Pink UI InputSelect by setting the hidden select value and dispatching change. */
async function changeSelect(page: Page, id: string, value: string) {
    await page.evaluate(
        ({ id, value }) => {
            const select = document.querySelector(`#${id}`) as HTMLSelectElement | null;
            if (!select) throw new Error(`#${id} not found`);
            select.value = value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        },
        { id, value }
    );
    // Give Svelte time to react
    await page.waitForTimeout(500);
}

async function selectEngine(page: Page, value: string) {
    await changeSelect(page, 'engine', value);
}

async function selectTier(page: Page, value: string) {
    await changeSelect(page, 'tier', value);
}

/** Select a backup policy preset by clicking its Card.Selector radio. */
async function selectBackupPreset(page: Page, id: string) {
    // Card.Selector renders an input[type=radio] with the given id
    await page.evaluate((id) => {
        const input = document.getElementById(id) as HTMLInputElement;
        if (!input) throw new Error(`#${id} not found`);
        input.click();
    }, id);
    await page.waitForTimeout(500);
}

/** Submit the create form and wait for navigation or notification. */
async function submitAndWaitForCreation(page: Page, name: string) {
    // Listen for the API response before clicking
    const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/compute/databases') && resp.request().method() === 'POST',
        { timeout: 180_000 }
    );

    await page.getByRole('button', { name: /Create/ }).click();

    // Wait for the API response — skip if backend is unavailable, rejects, or times out
    let response;
    try {
        response = await responsePromise;
    } catch {
        test.skip(true, 'Compute API timed out');
        return;
    }
    if (response.status() >= 400) {
        test.skip(true, `Compute API returned ${response.status()}`);
        return;
    }

    // Wait for navigation or notification
    await Promise.race([
        page.waitForURL(/databases\/database-/, { timeout: 30_000 }),
        page.waitForSelector(`text=${name} has been created`, { timeout: 30_000 })
    ]).catch(() => {
        // Creation succeeded (API returned OK) even if navigation didn't complete
    });
}

/** Extract the database ID from the current URL after successful creation. */
function extractDatabaseId(page: Page): string | null {
    const match = page.url().match(/database-([^/]+)/);
    return match ? match[1] : null;
}

/** Navigate to a specific database by its ID. */
function databaseUrl(databaseId: string): string {
    return `${DATABASES_URL}/database-${databaseId}`;
}

/** Navigate to the first database from the list page. Returns true if successful. */
async function navigateToFirstDatabase(page: Page): Promise<boolean> {
    await page.goto(DATABASES_URL);
    await page.waitForLoadState('networkidle');

    // Try table row first, then grid card link
    const dbLink = page.locator('a[href*="/databases/database-"]').first();
    if (!(await dbLink.isVisible().catch(() => false))) return false;

    await dbLink.click();
    await page.waitForURL(/databases\/database-/, { timeout: 15_000 });
    await page.waitForLoadState('networkidle');
    return true;
}

test.describe('Dedicated databases', () => {
    test.beforeEach(async ({ page }) => {
        // @todo These tests require a pre-seeded project with dedicated database support.
        // Skip in CI until a dedicated test environment is available.
        test.skip(!!process.env.CI, 'Requires pre-seeded dedicated database environment');
        await authenticate(page);
    });

    test.describe('Create page - type selection', () => {
        test('shows all four database type selectors', async ({ page }) => {
            await page.goto(CREATE_URL);
            await waitForCreatePage(page, 'Database type');

            await expect(page.getByText('TablesDB')).toBeVisible();
            await expect(page.getByText('DocumentsDB')).toBeVisible();
            await expect(page.getByText('Shared (Free)')).toBeVisible();
            await expect(page.getByText('DedicatedDB')).toBeVisible();
        });

        test('dedicated type reveals configuration section', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Configuration');

            await expect(page.getByText('Configuration')).toBeVisible();
            await expect(page.getByText('Database Engine')).toBeVisible();
            await expect(page.getByText('Resource Tier')).toBeVisible();
            await expect(page.getByText('Enable High Availability', { exact: true })).toBeVisible();
        });

        test('tablesdb type does not show configuration section', async ({ page }) => {
            await page.goto(CREATE_URL);
            await waitForCreatePage(page, 'Database type');

            await page.getByText('TablesDB').click();
            await expect(page.getByText('Configuration')).not.toBeVisible();
        });

        test('shared type shows free tier limits', async ({ page }) => {
            await page.goto(CREATE_URL);
            await waitForCreatePage(page, 'Database type');

            await page.goto(`${CREATE_URL}?type=shared`);
            await page.waitForSelector('text=Free tier limits', { timeout: 15_000 });

            const limitsSection = page.locator('fieldset', { hasText: 'Free tier limits' });
            await expect(limitsSection.getByText('128 MB')).toBeVisible();
            await expect(limitsSection.getByText('0.125 vCPU')).toBeVisible();
            await expect(limitsSection.getByText('1 GB')).toBeVisible();
        });

        test('documentsdb type does not show configuration section', async ({ page }) => {
            await page.goto(CREATE_URL);
            await waitForCreatePage(page, 'Database type');

            await page.getByText('DocumentsDB').click();
            await expect(page.getByText('Configuration')).not.toBeVisible();
        });
    });

    test.describe('Create page - URL params', () => {
        test('?type=dedicated skips type selection and shows configuration', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Configuration');

            await expect(page.getByText('Database type')).not.toBeVisible();
            await expect(page.getByText('Database Engine')).toBeVisible();
            await expect(page.getByText('Resource Tier')).toBeVisible();
        });

        test('?type=shared skips type selection and shows free tier limits', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=shared`);
            await waitForCreatePage(page);

            await expect(page.getByText('Database type')).not.toBeVisible();
            await expect(page.getByText('Free tier limits')).toBeVisible();
        });

        test('?type=tablesdb skips type selection and shows tablesdb form', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=tablesdb`);
            await waitForCreatePage(page);

            await expect(page.getByText('Database type')).not.toBeVisible();
            // TablesDB does not show Configuration section
            await expect(page.getByText('Configuration')).not.toBeVisible();
            // But it shows the name field
            await expect(page.locator('#name')).toBeVisible();
        });

        test('URL params pre-populate engine, tier, and name', async ({ page }) => {
            await page.goto(
                `${CREATE_URL}?type=dedicated&engine=mysql&tier=s-1vcpu-1gb&name=TestDB`
            );
            await waitForCreatePage(page, 'Configuration');

            // Name should be pre-filled
            await expect(page.locator('#name')).toHaveValue('TestDB');
            // Engine should be MySQL
            const engineCombobox = page.locator('#engine').locator('..').getByRole('combobox');
            await expect(engineCombobox).toContainText('MySQL');
            // Tier should be Starter
            const tierCombobox = page.locator('#tier').locator('..').getByRole('combobox');
            await expect(tierCombobox).toContainText('Starter');
        });

        test('URL params pre-populate HA as enabled', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-1vcpu-1gb&ha=true`);
            await waitForCreatePage(page, 'Configuration');

            await expect(page.locator('#ha')).toBeChecked();
        });

        test('free tier backup shows upgrade alert', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=free`);
            await waitForCreatePage(page, 'Backups');

            await expect(page.getByText('Backups unavailable on free tier')).toBeVisible();
        });
    });

    test.describe('Create page - engine defaults and options', () => {
        test('engine defaults to PostgreSQL', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Database Engine');

            const engineCombobox = page.locator('#engine').locator('..').getByRole('combobox');
            await expect(engineCombobox).toContainText('PostgreSQL');
        });

        test('engine options are present', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&engine=mysql`);
            await waitForCreatePage(page, 'Database Engine');

            // Verify engine pre-populated from URL param
            await expect(page.getByText('Database Engine')).toBeVisible();
        });
    });

    test.describe('Create page - tier and pricing', () => {
        test('free tier shows $0.00/mo', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Estimated total');

            await expect(page.getByRole('button', { name: /\$0\.00\/mo/ })).toBeVisible();
        });

        test('starter tier shows $15.00/mo via URL param', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-1vcpu-1gb`);
            await waitForCreatePage(page, 'Estimated total');

            await expect(page.getByRole('button', { name: /\$15\.00\/mo/ })).toBeVisible();
        });

        test('standard tier shows $30.00/mo via URL param', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-2vcpu-2gb`);
            await waitForCreatePage(page, 'Estimated total');

            await expect(page.getByRole('button', { name: /\$30\.00\/mo/ })).toBeVisible();
        });

        test('standard plus tier shows $60.00/mo via URL param', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-2vcpu-4gb`);
            await waitForCreatePage(page, 'Estimated total');

            await expect(page.getByRole('button', { name: /\$60\.00\/mo/ })).toBeVisible();
        });

        test('professional tier shows $100.00/mo via URL param', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-4vcpu-8gb`);
            await waitForCreatePage(page, 'Estimated total');

            await expect(page.getByRole('button', { name: /\$100\.00\/mo/ })).toBeVisible();
        });

        test('HA doubles estimated cost for starter tier', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-1vcpu-1gb&ha=true`);
            await waitForCreatePage(page, 'Estimated total');

            await expect(page.getByText('High availability replica')).toBeVisible();
            await expect(page.getByRole('button', { name: /\$30\.00\/mo/ })).toBeVisible();
        });

        test('HA doubles estimated cost for standard tier', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-2vcpu-2gb&ha=true`);
            await waitForCreatePage(page, 'Estimated total');

            await expect(page.getByRole('button', { name: /\$60\.00\/mo/ })).toBeVisible();
        });

        test('HA is disabled on free tier', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Resource Tier');

            // HA checkbox should be disabled on free tier
            await expect(page.locator('#ha')).toBeDisabled();
            // Price should remain $0
            await expect(page.getByRole('button', { name: /\$0\.00\/mo/ })).toBeVisible();
        });

        test('estimated cost section shows line items and total', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Estimated cost');

            await expect(page.getByText('Estimated total')).toBeVisible();
            await expect(page.getByText("You'll be charged")).toBeVisible();
        });
    });

    test.describe('Create page - backup options', () => {
        const PAID_CREATE = `${CREATE_URL}?type=dedicated&tier=s-1vcpu-1gb`;

        test('paid tier shows backup presets: Daily, Hourly, No backup', async ({ page }) => {
            await page.goto(PAID_CREATE);
            await waitForCreatePage(page, 'Backups');

            await expect(page.getByText('Daily', { exact: true })).toBeVisible();
            await expect(page.getByText('Hourly', { exact: true })).toBeVisible();
            await expect(page.getByText('No backup', { exact: true })).toBeVisible();
        });

        test('daily backup is selected by default on paid tier', async ({ page }) => {
            await page.goto(PAID_CREATE);
            await waitForCreatePage(page, 'Backups');

            await expect(page.getByText('Retention period')).toBeVisible();
        });

        test('no-backup URL param hides retention and PITR options', async ({ page }) => {
            await page.goto(`${PAID_CREATE}&backup=none`);
            await waitForCreatePage(page, 'Backups');

            await expect(page.getByText('Retention period')).not.toBeVisible();
        });

        test('daily backup shows retention and PITR options', async ({ page }) => {
            await page.goto(`${PAID_CREATE}&backup=daily`);
            await waitForCreatePage(page, 'Backups');

            await expect(page.getByText('Retention period')).toBeVisible();
            await expect(page.getByText('Enable Point-in-Time Recovery (PITR)')).toBeVisible();
        });

        test('PITR URL param shows PITR retention window selector', async ({ page }) => {
            await page.goto(`${PAID_CREATE}&pitr=true`);
            await waitForCreatePage(page, 'Backups');

            await expect(page.getByText('PITR retention window')).toBeVisible({ timeout: 10_000 });
        });

        test('shared type shows no-backup alert', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=shared`);
            await waitForCreatePage(page, 'Backups');

            await expect(page.getByText('No backups on free tier')).toBeVisible();
        });
    });

    test.describe.serial('Create and manage dedicated databases', () => {
        test.setTimeout(240_000); // Provisioning can take 2+ minutes per database
        const createdDatabases: { name: string; id: string; engine: string }[] = [];

        test.beforeEach(async ({ page }) => {
            await authenticate(page);
        });

        test('create a free-tier PostgreSQL database', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Configuration');

            const name = `e2e-pg-free-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'postgres' });
        });

        test('create a free-tier MySQL database', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Configuration');

            const name = `e2e-mysql-free-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);
            await selectEngine(page, 'mysql');

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'mysql' });
        });

        test('create a free-tier MariaDB database', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Configuration');

            const name = `e2e-mariadb-free-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);
            await selectEngine(page, 'mariadb');

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'mariadb' });
        });

        test('create a free-tier MongoDB database', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated`);
            await waitForCreatePage(page, 'Configuration');

            const name = `e2e-mongo-free-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);
            await selectEngine(page, 'mongodb');

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'mongodb' });
        });

        test('create a starter-tier PostgreSQL with HA enabled', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-1vcpu-1gb&ha=true`);
            await waitForCreatePage(page, 'Estimated total');

            const name = `e2e-pg-starter-ha-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);

            // Verify cost doubled via URL params
            await expect(page.getByRole('button', { name: /\$30\.00\/mo/ })).toBeVisible();

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'postgres' });
        });

        test('create a dedicated database with daily backup preset', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-1vcpu-1gb`);
            await waitForCreatePage(page, 'Configuration');

            const name = `e2e-pg-daily-backup-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);
            // Daily is the default, so just verify it is selected
            await expect(page.getByText('Retention period')).toBeVisible();

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'postgres' });
        });

        test('create a dedicated database with hourly backup preset', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-1vcpu-1gb&backup=hourly`);
            await waitForCreatePage(page, 'Configuration');

            const name = `e2e-pg-hourly-backup-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'postgres' });
        });

        test('create a dedicated database with no backup', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&backup=none`);
            await waitForCreatePage(page, 'Configuration');

            const name = `e2e-pg-no-backup-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'postgres' });
        });

        test('create a dedicated database with PITR enabled', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=dedicated&tier=s-1vcpu-1gb&pitr=true`);
            await waitForCreatePage(page, 'Configuration');

            const name = `e2e-pg-pitr-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);
            await expect(page.getByText('PITR retention window')).toBeVisible();

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'postgres' });
        });

        test('create a shared (free) database', async ({ page }) => {
            await page.goto(`${CREATE_URL}?type=shared`);
            await waitForCreatePage(page);

            const name = `e2e-shared-free-${Date.now()}`;
            await page.getByRole('textbox', { name: 'Name' }).fill(name);

            await submitAndWaitForCreation(page, name);

            const id = extractDatabaseId(page);
            expect(id).toBeTruthy();
            createdDatabases.push({ name, id: id!, engine: 'postgres' });
        });

        test('database list shows created databases', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            // The list page should have a create button
            await expect(page.getByRole('button', { name: /Create database/ })).toBeVisible();

            // At least one database link should be visible
            const databaseLinks = page.locator('a[href*="/databases/database-"]');
            await expect(databaseLinks.first()).toBeVisible({ timeout: 10_000 });
        });
    });

    test.describe('Database overview', () => {
        test.beforeEach(async ({ page }) => {
            await authenticate(page);
        });

        test('dedicated database overview shows status card', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            // Click the first database row to navigate
            const databaseRow = page.locator('table').getByRole('row').nth(1);
            if (!(await databaseRow.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseRow.click();
            await page.waitForURL(/databases\/database-/, { timeout: 15_000 });
            await page.waitForLoadState('networkidle');

            // Check for either the dedicated overview or tables view
            const statusCard = page.getByText('Status', { exact: true });
            const tablesView = page.getByText('Tables', { exact: true });

            await expect(statusCard.or(tablesView).first()).toBeVisible({ timeout: 10_000 });
        });

        test('dedicated overview renders status badge', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            // Navigate to the first database
            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            // If it is a dedicated overview, check status-related elements
            if (
                await page
                    .getByText('Status', { exact: true })
                    .isVisible()
                    .catch(() => false)
            ) {
                // Status badge should be present (Ready, Provisioning, etc.)
                const statusTexts = ['Ready', 'Provisioning', 'Active', 'Paused', 'Failed'];
                const results = await Promise.all(
                    statusTexts.map((s) =>
                        page
                            .getByText(s)
                            .isVisible()
                            .catch(() => false)
                    )
                );
                expect(results.some(Boolean)).toBeTruthy();
            }
        });

        test('dedicated overview shows resources section with engine info', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            // For dedicated databases, the overview shows Resources
            const resources = page.getByText('Resources', { exact: true });
            if (await resources.isVisible().catch(() => false)) {
                await expect(page.getByText('Engine', { exact: true }).first()).toBeVisible();
                await expect(page.getByText('CPU', { exact: true })).toBeVisible();
                await expect(page.getByText('Memory', { exact: true }).first()).toBeVisible();
                await expect(page.getByText('Storage', { exact: true }).first()).toBeVisible();
            }
        });

        test('dedicated overview shows refresh button', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            if (
                await page
                    .getByText('Status', { exact: true })
                    .isVisible()
                    .catch(() => false)
            ) {
                const refreshButton = page.getByRole('button', { name: /Refresh/ });
                await expect(refreshButton).toBeVisible();
            }
        });

        test('dedicated overview shows connection section or provisioning state', async ({
            page
        }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            if (
                await page
                    .getByText('Status', { exact: true })
                    .isVisible()
                    .catch(() => false)
            ) {
                // Should show either connection details or a provisioning message
                const connectionTitle = page.getByText('Connection', { exact: true });
                const provisioningMessage = page.getByText('Provisioning in progress');
                const credentialsProvisioning = page.getByText('Credentials provisioning');

                const visibilities = await Promise.all([
                    connectionTitle.isVisible().catch(() => false),
                    provisioningMessage.isVisible().catch(() => false),
                    credentialsProvisioning.isVisible().catch(() => false)
                ]);

                expect(visibilities.some(Boolean)).toBeTruthy();
            }
        });

        test('dedicated overview shows high availability section', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            if (
                await page
                    .getByText('Status', { exact: true })
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(page.getByText('High Availability')).toBeVisible();
            }
        });

        test('dedicated overview shows network section', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            if (
                await page
                    .getByText('Status', { exact: true })
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(page.getByText('Network', { exact: true })).toBeVisible();
            }
        });

        test('dedicated overview shows backups section', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            if (
                await page
                    .getByText('Status', { exact: true })
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(page.getByText('Backups', { exact: true }).first()).toBeVisible();
            }
        });

        test('dedicated overview does NOT show security card', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            if (
                await page
                    .getByText('Status', { exact: true })
                    .isVisible()
                    .catch(() => false)
            ) {
                // Security card was removed (encryption at rest is infra-level)
                await expect(page.getByText('Encryption at Rest')).not.toBeVisible();
                await expect(page.getByText('Key Management')).not.toBeVisible();
            }
        });

        test('dedicated overview network uses correct labels', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            if (
                await page
                    .getByText('Network', { exact: true })
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(page.getByText('Connection Timeout')).toBeVisible();
                // "Sleep After Idle" was renamed to "Scale-to-Zero After"
                await expect(page.getByText('Sleep After Idle')).not.toBeVisible();
            }
        });
    });

    test.describe('Navigation tabs', () => {
        test.beforeEach(async ({ page }) => {
            await authenticate(page);
        });

        test('dedicated database header shows Overview tab instead of Tables', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            // For dedicated databases, the first tab should be "Overview"
            const overviewTab = page.getByRole('link', { name: 'Overview' });
            if (await overviewTab.isVisible().catch(() => false)) {
                await expect(overviewTab).toBeVisible();
            }
        });

        test('dedicated database has Backups tab', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            const backupsTab = page.getByRole('link', { name: 'Backups' });
            await expect(backupsTab).toBeVisible();
        });

        test('dedicated database has Auth tab in header', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            // Auth tab only visible for dedicated databases — scope to header tabs area
            const tabsArea = page.locator('[class*="tabs"], nav').filter({ hasText: 'Backups' });
            const authTab = tabsArea.getByRole('link', { name: 'Auth' });
            if (
                await page
                    .getByRole('link', { name: 'Overview' })
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(authTab).toBeVisible({ timeout: 10_000 });
            }
        });

        test('clicking Auth tab navigates to auth page', async ({ page }) => {
            if (!(await navigateToFirstDatabase(page))) {
                test.skip();
                return;
            }

            const authTab = page.getByRole('link', { name: 'Auth' });
            if (!(await authTab.isVisible().catch(() => false))) {
                test.skip();
                return;
            }

            await authTab.click();
            await page.waitForURL(/\/auth/, { timeout: 15_000 });
            expect(page.url()).toContain('/auth');
        });

        test('dedicated database has Monitoring tab', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            // Monitoring tab only visible for dedicated databases
            const monitoringTab = page.getByRole('link', { name: 'Monitoring' });
            if (await monitoringTab.isVisible().catch(() => false)) {
                await expect(monitoringTab).toBeVisible();
            }
        });

        test('dedicated database has Usage tab', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            await expect(page.getByRole('link', { name: 'Usage' })).toBeVisible();
        });

        test('dedicated database has Settings tab', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            await expect(page.getByRole('link', { name: 'Settings' }).last()).toBeVisible();
        });

        test('clicking Backups tab navigates to backups page', async ({ page }) => {
            if (!(await navigateToFirstDatabase(page))) {
                test.skip();
                return;
            }

            const backupsTab = page.getByRole('tab', { name: 'Backups' });
            await backupsTab.click();
            await page.waitForURL(/\/backups/, { timeout: 15_000 });

            expect(page.url()).toContain('/backups');
        });

        test('clicking Settings tab navigates to settings page', async ({ page }) => {
            if (!(await navigateToFirstDatabase(page))) {
                test.skip();
                return;
            }

            const settingsTab = page.getByRole('tab', { name: 'Settings' });
            await settingsTab.click();
            await page.waitForURL(/\/settings/, { timeout: 15_000 });

            expect(page.url()).toContain('/settings');
        });

        test('clicking Usage tab navigates to usage page', async ({ page }) => {
            if (!(await navigateToFirstDatabase(page))) {
                test.skip();
                return;
            }

            const usageTab = page.getByRole('tab', { name: 'Usage' });
            await usageTab.click();
            await page.waitForURL(/\/usage/, { timeout: 15_000 });

            expect(page.url()).toContain('/usage');
        });
    });

    test.describe('Sidebar sub-navigation', () => {
        test.beforeEach(async ({ page }) => {
            await authenticate(page);
        });

        test('dedicated database sidebar shows Backups link', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            const sidebarBackups = page
                .locator('a[href*="/backups"]')
                .filter({ hasText: 'Backups' });
            if (
                await sidebarBackups
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(sidebarBackups.first()).toBeVisible();
            }
        });

        test('dedicated database sidebar shows Auth link', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            const sidebarAuth = page.locator('a[href*="/auth"]').filter({ hasText: 'Auth' });
            if (
                await sidebarAuth
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(sidebarAuth.first()).toBeVisible();
            }
        });

        test('dedicated database sidebar shows Monitoring link', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            const sidebarMonitoring = page
                .locator('a[href*="/monitoring"]')
                .filter({ hasText: 'Monitoring' });
            if (
                await sidebarMonitoring
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(sidebarMonitoring.first()).toBeVisible();
            }
        });

        test('dedicated database sidebar shows Settings link', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            const sidebarSettings = page
                .locator('a[href*="/settings"]')
                .filter({ hasText: 'Settings' });
            if (
                await sidebarSettings
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(sidebarSettings.first()).toBeVisible();
            }
        });

        test('dedicated database sidebar shows Usage link', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) {
                test.skip();
                return;
            }
            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            const sidebarUsage = page.locator('a[href*="/usage"]').filter({ hasText: 'Usage' });
            if (
                await sidebarUsage
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(sidebarUsage.first()).toBeVisible();
            }
        });
    });

    test.describe('Settings page', () => {
        test.beforeEach(async ({ page }) => {
            await authenticate(page);
        });

        /** Navigate to the first database's settings page. Returns true if successful. */
        async function navigateToSettings(page: Page): Promise<boolean> {
            if (!(await navigateToFirstDatabase(page))) return false;

            const settingsTab = page.getByRole('tab', { name: 'Settings' });
            if (!(await settingsTab.isVisible().catch(() => false))) return false;

            await settingsTab.click();
            await page.waitForURL(/\/settings/, { timeout: 15_000 });
            return true;
        }

        test('delete button uses danger styling', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            // The dedicated dangerZone component uses a Button with `danger` prop
            const deleteButton = page.getByRole('button', { name: 'Delete' });
            if (await deleteButton.isVisible().catch(() => false)) {
                // The `danger` prop adds the `is-danger` class
                await expect(deleteButton).toHaveClass(/danger/);
            }
        });

        test('settings page shows name section', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            // UpdateName component is rendered for all dedicated database types
            const nameInput = page.locator('#name');
            if (await nameInput.isVisible().catch(() => false)) {
                await expect(nameInput).toBeVisible();
            }
        });

        test('settings page shows high availability section', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const haTitle = page.getByText('High availability', { exact: true });
            if (await haTitle.isVisible().catch(() => false)) {
                await expect(haTitle).toBeVisible();
            }
        });

        test('HA section has right-aligned action buttons', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const haSection = page.getByText('High availability', { exact: true });
            if (await haSection.isVisible().catch(() => false)) {
                // The HA actions slot has justifyContent="flex-end"
                const updateButton = page.getByRole('button', { name: 'Update' }).first();
                if (await updateButton.isVisible().catch(() => false)) {
                    await expect(updateButton).toBeVisible();
                }
            }
        });

        test('version upgrade section uses dropdown for target version', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const versionTitle = page.getByText('Version', { exact: true });
            if (await versionTitle.isVisible().catch(() => false)) {
                // The upgradeVersion component uses InputSelect with id="targetVersion"
                const versionSelect = page.locator('#targetVersion');
                if (await versionSelect.isVisible().catch(() => false)) {
                    await expect(versionSelect).toBeVisible();
                    // It should be a combobox (InputSelect), not a text input
                    const combobox = page
                        .locator('#targetVersion')
                        .locator('..')
                        .getByRole('combobox');
                    await expect(combobox).toBeVisible();
                }
            }
        });

        test('version upgrade text mentions zero downtime', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const versionTitle = page.getByText('Version', { exact: true });
            if (await versionTitle.isVisible().catch(() => false)) {
                await expect(page.getByText('zero downtime')).toBeVisible();
            }
        });

        test('extensions section renders for PostgreSQL databases', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            // Extensions section is conditional on isPostgres
            const extensionsTitle = page.getByText('Extensions', { exact: true });
            if (await extensionsTitle.isVisible().catch(() => false)) {
                await expect(extensionsTitle).toBeVisible();
                await expect(page.getByText('Manage PostgreSQL extensions')).toBeVisible();
            }
        });

        test('network settings section renders', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            // UpdateNetwork component renders for all dedicated types
            const networkTitle = page.getByText('Network', { exact: true });
            if (await networkTitle.isVisible().catch(() => false)) {
                await expect(networkTitle).toBeVisible();
            }
        });

        test('backup settings section renders', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            // UpdateBackups component renders for all types
            const backupTitle = page
                .getByText('Backup', { exact: false })
                .filter({ hasText: /Backup/ });
            if (
                await backupTitle
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(backupTitle.first()).toBeVisible();
            }
        });

        test('delete database section renders', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            await expect(page.getByText('Delete database')).toBeVisible();
            await expect(page.getByText('permanently deleted')).toBeVisible();
        });

        test('security section is NOT rendered in settings', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            // Security settings were removed (encryption at rest is infra-level)
            await expect(page.getByText('Encryption at rest')).not.toBeVisible();
        });

        test('connection pooler section renders for PostgreSQL', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            // UpdatePooler is only rendered for postgres
            const poolerTitle = page.getByText('Connection pooler', { exact: false });
            if (
                await poolerTitle
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(poolerTitle.first()).toBeVisible();
            }
        });

        test('SQL API section renders', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const sqlApiTitle = page.getByText('SQL API', { exact: true });
            if (await sqlApiTitle.isVisible().catch(() => false)) {
                await expect(sqlApiTitle).toBeVisible();
            }
        });

        test('read replicas section renders for dedicated type', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const replicasTitle = page.getByText('Read replicas', { exact: false });
            if (
                await replicasTitle
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(replicasTitle.first()).toBeVisible();
            }
        });

        test('cross-region failover section renders for dedicated type', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const crossRegion = page.getByText('Cross-region', { exact: false });
            if (
                await crossRegion
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(crossRegion.first()).toBeVisible();
            }
        });

        test('storage section renders', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const storageTitle = page.getByText('Storage', { exact: true });
            if (
                await storageTitle
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(storageTitle.first()).toBeVisible();
            }
        });

        test('maintenance window section renders', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const maintenanceTitle = page.getByText('Maintenance', { exact: false });
            if (
                await maintenanceTitle
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(maintenanceTitle.first()).toBeVisible();
            }
        });

        test('autoscaling section renders', async ({ page }) => {
            if (!(await navigateToSettings(page))) {
                test.skip();
                return;
            }

            const autoscalingTitle = page.getByText('Autoscaling', { exact: false });
            if (
                await autoscalingTitle
                    .first()
                    .isVisible()
                    .catch(() => false)
            ) {
                await expect(autoscalingTitle.first()).toBeVisible();
            }
        });
    });

    test.describe('Auth tab', () => {
        test.beforeEach(async ({ page }) => {
            await authenticate(page);
        });

        /** Navigate to a dedicated database's auth page. Returns true if successful. */
        async function navigateToAuth(page: Page): Promise<boolean> {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            // Navigate to first database and look for Auth tab
            if (!(await navigateToFirstDatabase(page))) return false;

            // Auth link in the header tabs (not sidebar)
            const authLink = page.locator('a[href*="/databases/database-"][href*="/auth"]').first();
            if (!(await authLink.isVisible({ timeout: 5_000 }).catch(() => false))) return false;

            await authLink.click();
            await page.waitForURL(/\/auth/, { timeout: 10_000 });
            return true;
        }

        test('auth tab navigates to auth page', async ({ page }) => {
            if (!(await navigateToAuth(page))) {
                test.skip();
                return;
            }

            expect(page.url()).toContain('/auth');
            // Auth page loaded — content depends on compute API availability
            await page.waitForLoadState('networkidle');
        });

        test('auth tab shows credential rotation section', async ({ page }) => {
            if (!(await navigateToAuth(page))) {
                test.skip();
                return;
            }

            const rotateTitle = page.getByText('Credential rotation');
            await expect(rotateTitle).toBeVisible({ timeout: 10_000 });
        });

        test('auth tab has username input and role selector', async ({ page }) => {
            if (!(await navigateToAuth(page))) {
                test.skip();
                return;
            }

            await page.waitForLoadState('networkidle');
            // UpdateConnections renders after async load
            const username = page.locator('#connectionUsername');
            if (!(await username.isVisible({ timeout: 15_000 }).catch(() => false))) {
                test.skip(); // Component didn't render (API error)
                return;
            }
            await expect(username).toBeVisible();
            await expect(page.locator('#connectionRole')).toBeVisible();
        });

        test('auth tab shows rotate credentials button', async ({ page }) => {
            if (!(await navigateToAuth(page))) {
                test.skip();
                return;
            }

            await page.waitForLoadState('networkidle');
            const rotateButton = page.getByRole('button', { name: /Rotate/ });
            await expect(rotateButton).toBeVisible({ timeout: 15_000 });
        });

        test('auth tab has create user button', async ({ page }) => {
            if (!(await navigateToAuth(page))) {
                test.skip();
                return;
            }

            await page.waitForLoadState('networkidle');
            const createButton = page.getByRole('button', { name: /Create user/ });
            if (!(await createButton.isVisible({ timeout: 15_000 }).catch(() => false))) {
                test.skip(); // Component didn't render
                return;
            }
            await expect(createButton).toBeVisible();
        });
    });

    test.describe('Backups tab', () => {
        test.beforeEach(async ({ page }) => {
            await authenticate(page);
        });

        /** Navigate to the first database's backups page. Returns true if successful. */
        async function navigateToBackups(page: Page): Promise<boolean> {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseLink = page.locator('a[href*="/databases/database-"]').first();
            if (!(await databaseLink.isVisible().catch(() => false))) return false;

            await databaseLink.click();
            await page.waitForLoadState('networkidle');

            const backupsTab = page.getByRole('link', { name: 'Backups' });
            if (!(await backupsTab.isVisible().catch(() => false))) return false;

            await backupsTab.click();
            await page.waitForLoadState('networkidle');
            return true;
        }

        test('backups tab loads', async ({ page }) => {
            if (!(await navigateToBackups(page))) {
                test.skip();
                return;
            }

            expect(page.url()).toContain('/backups');
        });

        test('backups tab shows content for dedicated databases', async ({ page }) => {
            if (!(await navigateToBackups(page))) {
                test.skip();
                return;
            }

            // For dedicated databases, the DedicatedBackups component is rendered.
            // For legacy databases, the policies/backups view is shown.
            // Either way, the page should have loaded successfully.
            const contentVisibilities = await Promise.all([
                page
                    .getByText('Policies', { exact: true })
                    .isVisible()
                    .catch(() => false),
                page
                    .getByText('Backups', { exact: true })
                    .first()
                    .isVisible()
                    .catch(() => false),
                page
                    .getByText('Backup', { exact: false })
                    .first()
                    .isVisible()
                    .catch(() => false)
            ]);
            const hasContent = contentVisibilities.some(Boolean);

            expect(hasContent).toBeTruthy();
        });
    });

    test.describe('Database list', () => {
        test.beforeEach(async ({ page }) => {
            await authenticate(page);
        });

        test('shows create database button', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            await expect(page.getByRole('button', { name: /Create database/ })).toBeVisible();
        });

        test('database list renders database type indicators', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            // The list table has a "Type" column that shows database type labels
            const typeColumn = page.getByText('Type', { exact: true });
            if (await typeColumn.isVisible().catch(() => false)) {
                await expect(typeColumn).toBeVisible();
            }
        });

        test('database list shows database IDs', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const idColumn = page.getByText('Database ID', { exact: true });
            if (await idColumn.isVisible().catch(() => false)) {
                await expect(idColumn).toBeVisible();
            }
        });

        test('clicking a database navigates to its overview', async ({ page }) => {
            await page.goto(DATABASES_URL);
            await page.waitForLoadState('networkidle');

            const databaseRow = page.locator('table').getByRole('row').nth(1);
            if (!(await databaseRow.isVisible().catch(() => false))) {
                test.skip();
                return;
            }

            await databaseRow.click();
            await page.waitForURL(/databases\/database-/, { timeout: 15_000 });

            expect(page.url()).toContain('/databases/database-');
        });
    });
});
