export function pageToOffset(page: number, limit: number): number {
    return page ? page * limit - limit : 0;
}
