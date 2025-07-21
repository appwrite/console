import traverse from '@babel/traverse';
import { parse } from '@babel/parser';
import { filterMissingPackages, fetchPackageVersions, updatePackageJson } from './package-manager';
import { getContext } from 'hono/context-storage';
import { HonoEnv } from './mastra/utils/runtime-context';

export const updateDependencies = async (files: Array<{ path: string; content: string }>) => {
    const runtimeContext = getContext<HonoEnv>().var.runtimeContext;
    const synapse = runtimeContext.get('synapseClient');

    console.time('getPackageJson');

    const packageJsonContent = await synapse.readFile({
        path: `./package.json`
    });

    if (!('content' in packageJsonContent) || typeof packageJsonContent.content !== 'string') {
        throw new Error('Could not read package.json');
    }

    const packageJson = JSON.parse(packageJsonContent.content);
    console.timeEnd('getPackageJson');

    console.time('parseImports');
    const imports = new Set<string>();

    // Process all files
    for (const { path, content } of files) {
        // Only parse TypeScript/JavaScript files
        const fileExt = path.split('.').pop()?.toLowerCase();
        if (fileExt && ['ts', 'tsx', 'js', 'jsx'].includes(fileExt)) {
            try {
                // Parse the code to AST with enhanced options
                const ast = parse(content, {
                    sourceType: 'module',
                    plugins: [
                        'typescript',
                        'jsx',
                        ['decorators', { decoratorsBeforeExport: true }],
                        'classProperties',
                        'exportDefaultFrom',
                        'throwExpressions',
                        'dynamicImport',
                        // Add more plugins for better compatibility
                        'optionalChaining',
                        'nullishCoalescingOperator',
                        'objectRestSpread',
                        'classPrivateProperties',
                        'classPrivateMethods'
                    ],
                    errorRecovery: true,
                    tokens: true, // Keep tokens for better error recovery
                    ranges: true // Keep ranges for better error reporting
                });

                // Traverse AST to find imports with error handling
                try {
                    traverse(ast, {
                        ImportDeclaration(path) {
                            try {
                                const importPath = path.node.source.value;
                                if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
                                    const packageName = importPath.startsWith('@')
                                        ? importPath.split('/').slice(0, 2).join('/')
                                        : importPath.split('/')[0];
                                    imports.add(packageName);
                                }
                            } catch (traverseError) {
                                console.warn('Error processing import:', traverseError);
                            }
                        }
                    });
                } catch (traverseError) {
                    console.warn('Error during AST traversal:', traverseError);
                }
            } catch (parseError) {
                console.warn(`Parse error in ${path}, skipping dependency analysis:`, parseError);
                // Continue execution without throwing
            }
        }
    }
    console.timeEnd('parseImports');

    if (!packageJson) {
        console.error(`Could not parse package.json`);
        return null;
    }

    // Check which imports are missing from package.json
    const allDependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };

    const missingPackages = filterMissingPackages(imports, allDependencies);

    if (missingPackages.length > 0) {
        const packageVersions = await fetchPackageVersions(missingPackages);

        // Update package.json with new dependencies
        updatePackageJson(packageJson, packageVersions);

        console.log(
            'Added packages:',
            packageVersions.map(
                ({ pkg, version, typesPackage }) =>
                    `${pkg}@${version}${
                        typesPackage ? ` + ${typesPackage.name}@${typesPackage.version}` : ''
                    }`
            )
        );

        console.log('Writing updated package.json to the sandbox');
        // Write updated package.json to the sandbox
        await synapse.createOrUpdateFile({
            filepath: './package.json',
            content: JSON.stringify(packageJson, null, 2)
        });
        console.log('Updated package.json written to the sandbox');

        // NPM install
        console.log('Installing packages');
        await synapse.executeCommand({
            command: 'bun install',
            cwd: '/home/daytona/workspace',
            timeout: 30000,
            throwOnError: true
        });
        console.log('Packages installed');

        return packageJson;
    } else {
        console.log('No missing packages');
    }

    return null;
};
