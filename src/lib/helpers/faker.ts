import { sdk } from '$lib/stores/sdk';
import { faker } from '@faker-js/faker';
import type { NestedNumberArray } from './types';
import { ID, type Models } from '@appwrite.io/console';
import { isWithinSafeRange } from '$lib/helpers/numbers';
import type { DatabaseType, Field } from '$database/(entity)';

export async function generateFields(
    project: Models.Project,
    databaseId: string,
    tableId: string,
    databaseType: DatabaseType
): Promise<Field[]> {
    const client = sdk.forProject(project.region, project.$id);

    switch (databaseType) {
        case 'legacy':
        case 'tablesdb': {
            return await Promise.all([
                client.tablesDB.createStringColumn({
                    databaseId,
                    tableId,
                    key: 'name',
                    size: 255,
                    required: false
                }),
                client.tablesDB.createEmailColumn({
                    databaseId,
                    tableId,
                    key: 'email',
                    required: false
                }),
                client.tablesDB.createIntegerColumn({
                    databaseId,
                    tableId,
                    key: 'age',
                    required: false,
                    min: 18,
                    max: 80
                }),
                client.tablesDB.createStringColumn({
                    databaseId,
                    tableId,
                    key: 'city',
                    size: 100,
                    required: false
                }),
                client.tablesDB.createStringColumn({
                    databaseId,
                    tableId,
                    key: 'description',
                    size: 1000,
                    required: false
                }),
                client.tablesDB.createBooleanColumn({
                    databaseId,
                    tableId,
                    key: 'active',
                    required: false
                }),
                client.tablesDB.createPointColumn({
                    databaseId,
                    tableId,
                    key: 'location',
                    required: false
                }),
                client.tablesDB.createLineColumn({
                    databaseId,
                    tableId,
                    key: 'route',
                    required: false
                })
            ]);
        }

        case 'documentsdb': /* doesn't need any fields */
        case 'vectordb': /* vector embeddings + metadata defined at collection creation */ {
            /* no individual field creation needed */
            break;
        }
    }
}

export function generateFakeRecords(
    fields: Field[],
    count: number
): {
    ids: string[];
    rows: Models.Row[];
} {
    if (count <= 0) return { ids: [], rows: [] };

    const filteredColumns = fields.filter(
        (col) => col.type !== 'relationship' && col.status === 'available'
    );

    const ids: string[] = [];
    const rows: Models.Row[] = [];

    for (let i = 0; i < count; i++) {
        const id = ID.unique();
        ids.push(id);

        let row: Record<
            string,
            string | number | boolean | Array<string | number | boolean | NestedNumberArray>
        > = {
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
                active: faker.datatype.boolean(),
                location: [faker.location.longitude(), faker.location.latitude()],
                route: Array.from({ length: 5 }, () => [
                    faker.location.longitude(),
                    faker.location.latitude()
                ])
            };
        } else {
            for (const column of filteredColumns) {
                row[column.key] = generateValueForField(column);
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

function generateValueForField(
    field: Field
): string | number | boolean | null | Array<string | number | boolean | NestedNumberArray> {
    if (field.array) {
        const arraySize = faker.number.int({ min: 1, max: 5 });
        const items: Array<string | number | NestedNumberArray | boolean> = [];

        for (let i = 0; i < arraySize; i++) {
            const itemAttribute = { ...field, array: false };
            const item = generateSingleValue(itemAttribute);
            if (item !== null) {
                items.push(item);
            }
        }

        return items;
    }

    return generateSingleValue(field);
}

function generateSingleValue(field: Field): string | number | boolean | NestedNumberArray | null {
    switch (field.type) {
        case 'string': {
            if ('format' in field && field.format) {
                switch (field.format) {
                    case 'email': {
                        return faker.internet.email();
                    }

                    case 'ip': {
                        return faker.internet.ip();
                    }

                    case 'url': {
                        return faker.internet.url();
                    }

                    case 'enum': {
                        const enumAttr = field as Models.ColumnEnum;
                        if (enumAttr.elements?.length > 0) {
                            return faker.helpers.arrayElement(enumAttr.elements);
                        }
                        return null;
                    }
                }
                return '';
            } else {
                const stringAttr = field as Models.ColumnString;
                const maxLength = Math.min(stringAttr.size ?? 255, 1000);
                return generateStringValue(field.key, maxLength);
            }
        }

        case 'integer': {
            const intAttr = field as Models.ColumnInteger;
            const min = isWithinSafeRange(intAttr.min) ? intAttr.min : 0;
            const fallbackMax = Math.max(min + 100, 100);
            const max = isWithinSafeRange(intAttr.max)
                ? intAttr.max
                : Math.min(fallbackMax, Number.MAX_SAFE_INTEGER);
            return faker.number.int({ min, max });
        }

        case 'double': {
            const floatAttr = field as Models.ColumnFloat;
            const min = isWithinSafeRange(floatAttr.min) ? floatAttr.min : 0;
            const fallbackMax = Math.max(min + 100, 100);
            const max = isWithinSafeRange(floatAttr.max)
                ? floatAttr.max
                : Math.min(fallbackMax, Number.MAX_SAFE_INTEGER);
            const precision = 4;

            return faker.number.float({ min, max, fractionDigits: precision });
        }

        case 'boolean': {
            return faker.datatype.boolean();
        }

        case 'datetime': {
            return faker.date.recent({ days: 365 }).toISOString();
        }

        case 'point': {
            return [faker.location.longitude(), faker.location.latitude()];
        }

        case 'linestring': {
            return Array.from({ length: 5 }, () => [
                faker.location.longitude(),
                faker.location.latitude()
            ]);
        }

        case 'polygon': {
            const points = Array.from({ length: 5 }, () => [
                faker.location.longitude(),
                faker.location.latitude()
            ]);
            points.push(points[0]); // close polygon
            return [points];
        }
        default: {
            return faker.lorem.word();
        }
    }
}
