export const toPnpmCommand = (command?: string | null) => {
    if (!command) {
        return command ?? undefined;
    }

    return command
        .replace(/\bnpm\s+ci\b/gi, 'pnpm install --frozen-lockfile')
        .replace(/\bnpm\s+install\b/gi, 'pnpm install')
        .replace(/\bnpm\s+run\b/gi, 'pnpm run');
};

export const normalizeFrameworkCommands = (frameworks) => {
    if (!frameworks?.frameworks?.length) {
        return frameworks;
    }

    frameworks.frameworks = frameworks.frameworks.map((framework) => ({
        ...framework,
        adapters: framework.adapters?.map((adapter) => ({
            ...adapter,
            installCommand: toPnpmCommand(adapter.installCommand),
            buildCommand: toPnpmCommand(adapter.buildCommand)
        }))
    }));

    return frameworks;
};
