import { faker } from '@faker-js/faker';
import type { Columns } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/store';
import type { Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';

export async function generateColumns(
    project: Models.Project,
    databaseId: string,
    collectionId: string
): Promise<Columns[]> {
    const client = sdk.forProject(project.region, project.$id);

    return await Promise.all([
        client.grids.createStringColumn(databaseId, collectionId, 'name', 255, false),
        client.grids.createEmailColumn(databaseId, collectionId, 'email', false),
        client.grids.createIntegerColumn(databaseId, collectionId, 'age', false, 0, 150),
        client.grids.createStringColumn(databaseId, collectionId, 'city', 100, false),
        client.grids.createStringColumn(databaseId, collectionId, 'description', 1000, false),
        client.grids.createBooleanColumn(databaseId, collectionId, 'active', false)
    ]);
}

export function generateFakeRecords(columns: Columns[], count: number): object[] {
    if (count <= 0) return [];

    const filteredColumns = columns.filter((col) => col.type !== 'relationship');

    if (filteredColumns.length === 0) {
        return Array.from({ length: count }, () => ({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            age: faker.number.int({ min: 18, max: 80 }),
            city: faker.location.city(),
            description: faker.lorem.sentence(),
            active: faker.datatype.boolean()
        }));
    }

    return Array.from({ length: count }, () => {
        const document: object = {};

        for (const column of filteredColumns) {
            document[column.key] = generateValueForColumn(column);
        }

        return document;
    });
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

function generateValueForColumn(attribute: Columns): string | number | boolean | null {
    switch (attribute.type) {
        case 'string': {
            const stringAttr = attribute as Models.ColumnString;
            const maxLength = Math.min(stringAttr.size ?? 255, 1000);
            return generateStringValue(attribute.key, maxLength);
        }

        case 'integer': {
            const intAttr = attribute as Models.ColumnInteger;
            const min = intAttr.min ?? 0;
            const max = intAttr.max ?? 1000000;
            return faker.number.int({ min, max });
        }

        case 'float': {
            const floatAttr = attribute as Models.ColumnFloat;
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
            const enumAttr = attribute as Models.ColumnEnum;
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
