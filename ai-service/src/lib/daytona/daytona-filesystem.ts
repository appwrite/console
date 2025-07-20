import { Sandbox } from '@daytonaio/sdk';

const baseDir = '/home/daytona/workspace';

interface File {
    path: string;
    isDir: boolean;
    content?: string;
}

const ignoredFiles = [
  'entities/User.json',
  'components.json',
  'eslint.config.js',
  'src/main.tsx',
  'src/lib/superdev.client.ts',
  'src/vite-env.d.ts',
  'src/index.html',
  'package-lock.json',
  'bun.lock',
  'src/hooks/use-mobile.tsx',
  'src/hooks/use-toast.tsx',
  'postcss.config.js',
  'tailwind.config.ts',
  'tsconfig.app.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'node_modules',
  'dist'
];

const isIgnored = (filePath: string, fileName: string): boolean => {
  return ignoredFiles.some((pattern) => {
      // Check exact filename match
      if (fileName === pattern) return true;

      // Check if path ends with the pattern (for relative paths)
      if (filePath.endsWith(pattern)) return true;

      // Check if path contains the pattern (for directories like node_modules)
      if (filePath.includes(`/${pattern}/`) || filePath.includes(`/${pattern}`)) return true;

      return false;
  });
};

export const getFileContent = async ({
  sandbox,
  filePath
}: {
  sandbox: Sandbox;
  filePath: string;
}) => {
  const fileContentBuffer = await sandbox.fs.downloadFile(filePath);
  const content = fileContentBuffer.toString('utf-8');
  return content;
};

export const listFilesInDir = async ({
  sandbox,
  dirPath,
  recursive,
  withContent
}: {
  sandbox: Sandbox;
  dirPath: string;
  recursive: boolean;
  withContent: boolean;
}): Promise<File[]> => {
  const result = await sandbox.fs.listFiles(`${baseDir}/${dirPath}`);
  // Filter out ignored files first
  const filteredFiles = result.filter((file) => {
      const filePath = `${baseDir}/${dirPath}/${file.name}`;
      return !isIgnored(filePath, file.name);
  });

  // Process all files in parallel
  const filePromises = filteredFiles.map(async (file) => {
      const absolutePath = `${baseDir}/${dirPath}/${file.name}`;
      // Remove baseDir from the path to get relative path
      const relativePath = absolutePath.replace(baseDir, '').replace(/^\/+/, '');

      // If it's a directory
      if (file.isDir) {
          // If recursive, get files from subdirectory but don't include the directory itself
          if (recursive) {
              const subFiles = await listFilesInDir({
                  sandbox,
                  dirPath: `${dirPath}/${file.name}`,
                  recursive,
                  withContent
              });
              return subFiles; // Return only the files from subdirectory
          }
          return []; // Don't include directories at all
      }

      // It's a file - create the file object conditionally
      const currentFile: File = withContent
          ? {
                path: relativePath,
                isDir: false,
                content: await getFileContent({ sandbox, filePath: absolutePath })
            }
          : {
                path: relativePath,
                isDir: false
            };

      return [currentFile];
  });

  // Wait for all promises to resolve in parallel
  const fileArrays = await Promise.all(filePromises);

  // Flatten the array of arrays
  return fileArrays.flat();
};

export const createOrUpdateFile = async ({
  sandbox,
  filePath,
  content
}: {
  sandbox: Sandbox;
  filePath: string;
  content: string;
}) => {
  const contentBuffer = Buffer.from(content, 'utf-8');
  const fullPath = `${baseDir}/${filePath}`;

  await sandbox.fs.uploadFile(contentBuffer, fullPath);

  return {
      path: filePath,
      content: contentBuffer.toString('utf-8')
  };
};

export const moveFile = async ({
  sandbox,
  filePath,
  newPath
}: {
  sandbox: Sandbox;
  filePath: string;
  newPath: string;
}) => {
  const fullPath = `${baseDir}/${filePath}`;
  const newFullPath = `${baseDir}/${newPath}`;

  await sandbox.fs.moveFiles(fullPath, newFullPath);

  return {
      message: 'File moved successfully',
      newPath: newFullPath,
      oldPath: fullPath
  };
};

export const deleteFile = async ({ sandbox, filePath }: { sandbox: Sandbox; filePath: string }) => {
  const fullPath = `${baseDir}/${filePath}`;
  await sandbox.fs.deleteFile(fullPath);

  return {
      message: 'File deleted successfully',
      path: filePath
  };
};