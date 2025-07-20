import { daytona } from "@/lib/daytona/daytona-client";

async function main() {
    const sandboxes = await daytona.list();
    console.log(`Deleting ${sandboxes.length} sandboxes`);
    for (const sandbox of sandboxes) {
        console.log(`Deleting sandbox ${sandbox.id}`);
        await sandbox.delete();
    }
}

main();