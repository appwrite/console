/**
 * SDK compatibility shims for exports missing from the current
 * @appwrite.io/console SDK version (a1b2dc2).
 *
 * @todo Remove once the SDK is updated to include both BAA addon
 * methods and the newer TablesDB types.
 */

export enum TablesDBIndexType {
    Key = 'key',
    Fulltext = 'fulltext',
    Unique = 'unique',
    Spatial = 'spatial'
}
