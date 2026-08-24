const BUCKET_URL = 'http://localhost/console/storage/bucket-a';

export const page = $state({ url: new URL(BUCKET_URL) });

export function navigateTo(href: string) {
    page.url = new URL(href, BUCKET_URL);
}
