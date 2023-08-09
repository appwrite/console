export async function waitUntil(condition: () => boolean, timeout = 1000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            if (condition()) {
                clearInterval(interval);
                resolve(undefined);
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error('Timeout'));
            }
        }, 10);
    });
}
