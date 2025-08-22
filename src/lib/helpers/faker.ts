import { faker } from '@faker-js/faker';
import type { Columns } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/store';
import { ID, type Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';

export async function generateColumns(
    project: Models.Project,
    databaseId: string,
    tableId: string
): Promise<Columns[]> {
    const client = sdk.forProject(project.region, project.$id);

    return await Promise.all([
        client.tablesDb.createStringColumn({
            databaseId,
            tableId,
            key: 'name',
            size: 255,
            required: false
        }),
        client.tablesDb.createEmailColumn({ databaseId, tableId, key: 'email', required: false }),
        client.tablesDb.createIntegerColumn({
            databaseId,
            tableId,
            key: 'age',
            required: false,
            min: 0,
            max: 150
        }),
        client.tablesDb.createStringColumn({
            databaseId,
            tableId,
            key: 'city',
            size: 100,
            required: false
        }),
        client.tablesDb.createStringColumn({
            databaseId,
            tableId,
            key: 'description',
            size: 1000,
            required: false
        }),
        client.tablesDb.createBooleanColumn({ databaseId, tableId, key: 'active', required: false })
    ]);
}

export function generateFakeRecords(
    columns: Columns[],
    count: number
): {
    ids: string[];
    rows: Models.Row[];
} {
    if (count <= 0) return { ids: [], rows: [] };

    const filteredColumns = columns.filter((col) => col.type !== 'relationship');

    const ids: string[] = [];
    const rows: Models.Row[] = [];

    for (let i = 0; i < count; i++) {
        const id = ID.unique();
        ids.push(id);

        let row: Record<string, string | number | boolean | Array<string | number | boolean>> = {
            $id: id
        };

        if (filteredColumns.length === 0) {
            row = {
                $id: id,
                name: faker.person.fullName(),
                email: faker.internet.email(),
                age: faker.number.int({ min: 18, max: 80 }),
                city: faker.location.city(),
                description: faker.lorem.sentence(),
                active: faker.datatype.boolean()
            };
        } else {
            for (const column of filteredColumns) {
                row[column.key] = generateValueForColumn(column);
            }
        }

        rows.push(row as unknown as Models.Row);
    }

    return { ids, rows };
}

function generateStringValue(key: string, maxLength: number): string {
    const lowerKey = key.toLowerCase();

    const generators: Record<string, () => string> = {
        name: () => faker.person.fullName(),
        email: () => faker.internet.email(),
        title: () => faker.lorem.words({ min: 1, max: 3 }),
        description: () => faker.lorem.paragraph(),
        content: () => faker.lorem.paragraph(),
        address: () => faker.location.streetAddress(),
        city: () => faker.location.city(),
        country: () => faker.location.country(),
        company: () => faker.company.name()
    };

    const matchingKey = Object.keys(generators).find((pattern) => lowerKey.includes(pattern));

    const text = matchingKey ? generators[matchingKey]() : faker.lorem.words({ min: 1, max: 5 });

    return text.length <= maxLength ? text : text.substring(0, maxLength);
}

function generateValueForColumn(
    column: Columns
): string | number | boolean | null | Array<string | number | boolean> {
    if (column.array) {
        const arraySize = faker.number.int({ min: 1, max: 5 });
        const items: Array<string | number | boolean> = [];

        for (let i = 0; i < arraySize; i++) {
            const itemAttribute = { ...column, array: false };
            const item = generateSingleValue(itemAttribute);
            if (item !== null) {
                items.push(item);
            }
        }

        return items;
    }

    return generateSingleValue(column);
}

function generateSingleValue(column: Columns): string | number | boolean | null {
    switch (column.type) {
        case 'string': {
            if ('format' in column && column.format) {
                switch (column.format) {
                    case 'email': {
                        return faker.internet.email();
                    }

                    case 'ip': {
                        return faker.internet.ip();
                    }

                    case 'url': {
                        return faker.internet.url();
                    }
                }
                return '';
            } else {
                const stringAttr = column as Models.ColumnString;
                const maxLength = Math.min(stringAttr.size ?? 255, 1000);
                return generateStringValue(column.key, maxLength);
            }
        }

        case 'integer': {
            const intAttr = column as Models.ColumnInteger;
            const min = intAttr.min ?? 0;
            const max = intAttr.max ?? 1000000;
            return faker.number.int({ min, max });
        }

        case 'float': {
            const floatAttr = column as Models.ColumnFloat;
            const min = floatAttr.min ?? 0;
            const max = floatAttr.max ?? 1000000;
            const precision = 2;
            return parseFloat(
                faker.number.float({ min, max, fractionDigits: precision }).toFixed(precision)
            );
        }

        case 'boolean': {
            return faker.datatype.boolean();
        }

        case 'datetime': {
            return faker.date.recent({ days: 365 }).toISOString();
        }

        case 'enum': {
            const enumAttr = column as Models.ColumnEnum;
            if (enumAttr.elements && enumAttr.elements.length > 0) {
                return faker.helpers.arrayElement(enumAttr.elements);
            }
            return null;
        }

        default: {
            return faker.lorem.word();
        }
    }
}
