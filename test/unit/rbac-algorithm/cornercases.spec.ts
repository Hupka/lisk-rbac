// tslint:disable: no-string-literal
import RBACModule from '../../../src/rbac-algorithm/algorithm';

describe('rbac', () => {
  describe('hierarchical', () => {
    const rbac = new RBACModule({
      roles: {
        user: {
          can: [
            {
              name: 'foo',
              operation: 'read',
              when: () => {
                return false;
              },
            },
          ],
        },
        admin: {
          can: [
            {
              name: 'foo',
              operation: 'read',
            },
          ],
          inherits: ['user'],
        },
        superadmin: {
          can: [],
          inherits: ['admin'],
        },
      },
    });
    // eslint-disable-next-line no-console
    console.log(rbac['_rules']);
    // eslint-disable-next-line no-console
    console.log(rbac['_rulesCompiled']);
    it('extend:overrrides', () => {
      expect(rbac.can('user', 'foo', 'read', {})).toEqual(false);
      expect(rbac.can('admin', 'foo', 'read', {})).toEqual(true);
      expect(rbac.can('superadmin', 'foo', 'read', {})).toEqual(true);
    });
  });
});
