export function getEngineDisplayName(engine: string): string {
    switch (engine) {
        case 'postgres':
            return 'PostgreSQL';
        case 'mysql':
            return 'MySQL';
        case 'mariadb':
            return 'MariaDB';
        case 'mongodb':
            return 'MongoDB';
        default:
            return engine;
    }
}
