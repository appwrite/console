interface PackageInfo {
  pkg: string;
  version: string;
  typesPackage: {
    name: string;
    version: string;
  } | null;
}

export function filterMissingPackages(
  imports: Set<string>,
  allDependencies: Record<string, string>
): string[] {
  return Array.from(imports).filter(
    (pkg) => !allDependencies[pkg] && !pkg.includes("@/")
  );
}

export async function fetchPackageVersions(
  missingPackages: string[]
): Promise<PackageInfo[]> {
  const packageVersionsPromises = missingPackages.map(async (pkg) => {
    const response = await fetch(`https://registry.npmjs.org/${pkg}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch package info for ${pkg}`);
    }
    const data = await response.json();
    const version = data["dist-tags"].latest;

    // Check if types package exists
    const typesPackage = pkg.startsWith("@")
      ? `@types/${pkg.split("/")[1]}` // For scoped packages, use the package name after scope
      : `@types/${pkg}`;

    let typesVersion: string | null = null;
    try {
      const typesResponse = await fetch(
        `https://registry.npmjs.org/${typesPackage}`
      );
      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        typesVersion = typesData["dist-tags"].latest;
      }
    } catch {
      console.log(`No types package found for ${pkg}`);
    }

    return {
      pkg,
      version: `^${version}`,
      typesPackage: typesVersion
        ? { name: typesPackage, version: `^${typesVersion}` }
        : null,
    };
  });

  return Promise.all(packageVersionsPromises);
}

export function updatePackageJson(
  packageJson: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  },
  packageVersions: PackageInfo[]
): void {
  packageVersions.forEach(({ pkg, version, typesPackage }) => {
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    packageJson.dependencies[pkg] = version;

    // Add types to devDependencies if available
    if (typesPackage) {
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }
      packageJson.devDependencies[typesPackage.name] = typesPackage.version;
    }
  });
}
