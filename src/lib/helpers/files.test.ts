import { describe, expect, it } from 'vitest';
import {
    DEPLOYMENT_ARCHIVE_EXTENSIONS,
    getInvalidDeploymentArchiveReason
} from './files';

describe('deployment archive extensions', () => {
    it('should include the compound tar.gz extension for the file picker accept attribute', () => {
        // On macOS a bare '.gz' accept token does not match 'code.tar.gz' files
        // (compound tar+gzip UTI), greying them out in the picker.
        expect(DEPLOYMENT_ARCHIVE_EXTENSIONS).toContain('tar.gz');
        expect(DEPLOYMENT_ARCHIVE_EXTENSIONS).toContain('gz');
    });

    it('should accept .tar.gz archives and reject other files', () => {
        const ok = [new File(['x'], 'code.tar.gz')];
        expect(getInvalidDeploymentArchiveReason(ok)).toBeNull();

        const upper = [new File(['x'], 'CODE.TAR.GZ')];
        expect(getInvalidDeploymentArchiveReason(upper)).toBeNull();

        const zip = [new File(['x'], 'code.zip')];
        expect(getInvalidDeploymentArchiveReason(zip)).toBe('invalid_extension');
    });
});
