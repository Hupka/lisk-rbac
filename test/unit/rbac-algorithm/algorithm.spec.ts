// tslint:disable: no-string-literal

import RBACModule from '../../../src/rbac-algorithm/algorithm';

describe('rbac', () => {
  describe('can', () => {
    const basic = new RBACModule({
      roles: {
        guest: {
          can: ['foo:read'],
        },
        user: {
          can: [
            {
              name: 'foo:update',
            },
          ],
        },
        admin: {
          can: [
            {
              name: 'foo',
              operation: 'remove',
            },
          ],
        },
        superadmin: {
          can: [
            {
              name: 'foo',
              operation: 'create',
              when: (ctx: any) => {
                return ctx.userId === ctx.ownerId;
              },
            },
          ],
        },
      },
    });

    const wildcard = new RBACModule({
      roles: {
        guest: {
          can: ['*:read'],
        },
        user: {
          can: ['foo:*'],
        },
        admin: {
          can: ['*'],
        },
      },
    });

    const wildcardNoMemo = new RBACModule({
      roles: {
        user: {
          can: ['foo:*'],
        },
      },
      memoize: false,
    });

    const hierarchical = new RBACModule({
      roles: {
        guest: {
          can: ['foo:read'],
        },
        anon: {
          can: [],
          inherits: ['guest'],
        },
        user: {
          can: [
            {
              name: 'foo:update',
            },
          ],
          inherits: ['guest'],
        },
        admin: {
          can: [
            {
              name: 'foo',
              operation: 'remove',
            },
          ],
          inherits: ['user'],
        },
        superadmin: {
          can: [
            {
              name: 'foo',
              operation: 'create',
              when: (ctx: any) => {
                return ctx.userId === ctx.ownerId;
              },
            },
          ],
          inherits: ['admin'],
        },
      },
    });

    describe('basic', () => {
      it('nonexist:can:false', () => {
        expect(basic.can('somebody', 'foo', 'read')).toEqual(false);
        expect(basic['_rulesCompiled']['somebody:foo:read']).toBeUndefined();
      });
      it('can:true #1', () => {
        expect(basic.can('guest', 'foo', 'read')).toEqual(true);
        expect(basic['_rulesCompiled']['guest:foo:read']).toEqual(true);
      });
      it('can:false #1', () => {
        expect(basic.can('guest', 'foo', 'update')).toEqual(false);
        expect(basic['_rulesCompiled']['guest:foo:update']).toBeUndefined();
      });
      it('can:true #2', () => {
        expect(basic.can('user', 'foo', 'update')).toEqual(true);
        expect(basic['_rulesCompiled']['user:foo:update']).toEqual(true);
      });
      it('can:false #2', () => {
        expect(basic.can('user', 'foo', 'remove')).toEqual(false);
        expect(basic['_rulesCompiled']['user:foo:remove']).toBeUndefined();
      });
      it('can:true #3', () => {
        expect(basic.can('admin', 'foo', 'remove')).toEqual(true);
        expect(basic['_rulesCompiled']['admin:foo:remove']).toEqual(true);
      });
      it('can:false #3', () => {
        expect(basic.can('admin', 'foo', 'create')).toEqual(false);
        expect(basic['_rulesCompiled']['admin:foo:create']).toBeUndefined();
      });
      it('can:nowhen:true', () => {
        expect(basic.can('superadmin', 'foo', 'create')).toEqual(true);
        expect(basic['_rulesCompiled']['superadmin:foo:create']).toBeDefined();
      });
      it('can:nowhen:false', () => {
        expect(basic.can('superadmin', 'foo', 'read')).toEqual(false);
        expect(basic['_rulesCompiled']['superadmin:foo:read']).toBeUndefined();
      });
      it('can:when:true', () => {
        expect(
          basic.can('superadmin', 'foo', 'create', {userId: 1, ownerId: 1})
        ).toEqual(true);
        expect(basic['_rulesCompiled']['superadmin:foo:create']).toBeDefined();
      });
      it('can:when:false', () => {
        expect(
          basic.can('superadmin', 'foo', 'create', {userId: 1, ownerId: 2})
        ).toEqual(false);
        expect(basic['_rulesCompiled']['superadmin:foo:create']).toBeDefined();
      });
    });
    describe('wildcard', () => {
      it('can:true #1', () => {
        expect(wildcard.can('guest', 'foo', 'read')).toEqual(true);
        expect(wildcard['_rulesCompiled']['guest:foo:read']).toEqual(true);
      });
      it('can:false #1', () => {
        expect(wildcard.can('guest', 'foo', 'update')).toEqual(false);
        expect(wildcard['_rulesCompiled']['guest:foo:update']).toBeUndefined();
      });
      it('can:true #2', () => {
        expect(wildcard.can('user', 'foo', 'read')).toEqual(true);
        expect(wildcard['_rulesCompiled']['user:foo:read']).toEqual(true);
      });
      it('can:false #2', () => {
        expect(wildcard.can('user', 'bar', 'update')).toEqual(false);
        expect(wildcard['_rulesCompiled']['user:bar:update']).toBeUndefined();
      });
      it('can:true #3', () => {
        expect(wildcard.can('admin', 'foo', 'read')).toEqual(true);
        expect(wildcard['_rulesCompiled']['admin:foo:read']).toEqual(true);
      });
      it('can:noMemo:true', () => {
        expect(wildcardNoMemo.can('user', 'foo', 'read')).toEqual(true);
        expect(
          wildcardNoMemo['_rulesCompiled']['user:foo:read']
        ).toBeUndefined();
      });
    });
    describe('hierarchical', () => {
      it('can:nonexist:false', () => {
        expect(hierarchical.can('somebody', 'foo', 'read')).toEqual(false);
        expect(
          hierarchical['_rulesCompiled']['somebody:foo:read']
        ).toBeUndefined();
      });
      it('can:true #1', () => {
        expect(hierarchical.can('guest', 'foo', 'read')).toEqual(true);
        expect(hierarchical['_rulesCompiled']['guest:foo:read']).toEqual(true);
      });
      it('can:false #1', () => {
        expect(hierarchical.can('guest', 'foo', 'update')).toEqual(false);
        expect(
          hierarchical['_rulesCompiled']['guest:foo:update']
        ).toBeUndefined();
      });
      it('can:true #2', () => {
        expect(hierarchical.can('anon', 'foo', 'read')).toEqual(true);
        expect(hierarchical['_rulesCompiled']['anon:foo:read']).toEqual(true);
      });
      it('can:false #2', () => {
        expect(hierarchical.can('anon', 'foo', 'update')).toEqual(false);
        expect(
          hierarchical['_rulesCompiled']['anon:foo:update']
        ).toBeUndefined();
      });
      it('can:true #3', () => {
        expect(hierarchical.can('user', 'foo', 'update')).toEqual(true);
        expect(hierarchical.can('user', 'foo', 'read')).toEqual(true);
        expect(hierarchical['_rulesCompiled']['user:foo:update']).toEqual(true);
        expect(hierarchical['_rulesCompiled']['user:foo:read']).toEqual(true);
      });
      it('can:false #3', () => {
        expect(hierarchical.can('user', 'foo', 'remove')).toEqual(false);
        expect(
          hierarchical['_rulesCompiled']['user:foo:remove']
        ).toBeUndefined();
      });
      it('can:true #4', () => {
        expect(hierarchical.can('admin', 'foo', 'remove')).toEqual(true);
        expect(hierarchical.can('admin', 'foo', 'read')).toEqual(true);
        expect(hierarchical.can('admin', 'foo', 'update')).toEqual(true);
        expect(hierarchical['_rulesCompiled']['admin:foo:remove']).toEqual(
          true
        );
        expect(hierarchical['_rulesCompiled']['admin:foo:read']).toEqual(true);
        expect(hierarchical['_rulesCompiled']['admin:foo:update']).toEqual(
          true
        );
      });
      it('can:false #4', () => {
        expect(hierarchical.can('admin', 'foo', 'create')).toEqual(false);
        expect(
          hierarchical['_rulesCompiled']['admin:foo:create']
        ).toBeUndefined();
      });
      it('can:nowhen:true', () => {
        expect(hierarchical.can('superadmin', 'foo', 'create')).toEqual(true);
        expect(hierarchical.can('superadmin', 'foo', 'remove')).toEqual(true);
        expect(hierarchical.can('superadmin', 'foo', 'update')).toEqual(true);
        expect(hierarchical.can('superadmin', 'foo', 'read')).toEqual(true);
        expect(
          hierarchical['_rulesCompiled']['superadmin:foo:create']
        ).toBeDefined();
        expect(
          hierarchical['_rulesCompiled']['superadmin:foo:remove']
        ).toBeDefined();
        expect(
          hierarchical['_rulesCompiled']['superadmin:foo:update']
        ).toBeDefined();
        expect(
          hierarchical['_rulesCompiled']['superadmin:foo:read']
        ).toBeDefined();
      });
      it('can:nowhen:false', () => {
        expect(hierarchical.can('superadmin', 'foo', 'restricted')).toEqual(
          false
        );
        expect(
          hierarchical['_rulesCompiled']['superadmin:foo:restricted']
        ).toBeUndefined();
      });
      it('can:when:true', () => {
        expect(
          hierarchical.can('superadmin', 'foo', 'create', {
            userId: 1,
            ownerId: 1,
          })
        ).toEqual(true);
        expect(
          hierarchical['_rulesCompiled']['superadmin:foo:create']
        ).toBeDefined();
      });
      it('can:when:false', () => {
        expect(
          hierarchical.can('superadmin', 'foo', 'create', {
            userId: 1,
            ownerId: 2,
          })
        ).toEqual(false);
        expect(
          hierarchical['_rulesCompiled']['superadmin:foo:create']
        ).toBeDefined();
      });
    });
  });

  describe('add', () => {
    it('basic:can:true', () => {
      const rbac = new RBACModule();
      rbac.add('guest', 'foo', 'read');
      expect(rbac.can('guest', 'foo', 'read')).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toEqual(true);
    });
    it('wildcard:can:true #1', () => {
      const rbac = new RBACModule();
      rbac.add('guest', 'foo', '*');
      expect(rbac.can('guest', 'foo', 'read')).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toEqual(true);
    });
    it('wildcard:can:true #2', () => {
      const rbac = new RBACModule();
      rbac.add('guest', '*', 'read');
      expect(rbac.can('guest', 'foo', 'read')).toEqual(true);
      expect(rbac.can('guest', 'bar', 'read')).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:bar:read']).toEqual(true);
    });
    it('hierarchical:can:true', () => {
      const rbac = new RBACModule({
        roles: {
          guest: {
            can: ['foo:read'],
          },
          user: {
            can: ['foo:update'],
            inherits: ['guest'],
          },
          admin: {
            can: ['foo:remove'],
            inherits: ['user'],
          },
        },
      });
      rbac.add('guest', 'foo', 'remove');
      rbac.add('user', 'foo', 'create', (ctx: any) => {
        return ctx.a === ctx.b;
      });

      expect(rbac.can('guest', 'foo', 'remove')).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:foo:remove']).toEqual(true);
      expect(rbac.can('user', 'foo', 'remove')).toEqual(true);
      expect(rbac['_rulesCompiled']['user:foo:remove']).toEqual(true);
      expect(rbac.can('admin', 'foo', 'create')).toEqual(true);
      expect(rbac['_rulesCompiled']['admin:foo:create']).toBeDefined();
      expect(rbac.can('admin', 'foo', 'create', {a: 1, b: 1})).toEqual(true);
      expect(rbac.can('admin', 'foo', 'create', {a: 1, b: 2})).toEqual(false);
    });
  });
  describe('remove', () => {
    it('basic:can:false', () => {
      const rbac = new RBACModule({
        roles: {
          guest: {
            can: ['foo:read'],
          },
        },
      });
      expect(rbac.can('guest', 'foo', 'read')).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toEqual(true);
      rbac.remove('guest', 'foo', 'read');
      expect(rbac.can('guest', 'foo', 'read')).toEqual(false);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toBeUndefined();
    });
    it('wildcard:can:false #1', () => {
      const rbac = new RBACModule({
        roles: {
          guest: {
            can: ['foo:read'],
          },
        },
      });
      expect(rbac.can('guest', 'foo', 'read')).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toEqual(true);
      rbac.remove('guest', 'foo');
      expect(rbac.can('guest', 'foo', 'read')).toEqual(false);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toBeUndefined();
    });
    it('wildcard:can:false #2', () => {
      const rbac = new RBACModule({
        roles: {
          guest: {
            can: ['foo:read'],
          },
        },
      });
      expect(rbac.can('guest', 'foo', 'read')).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toEqual(true);
      rbac.remove('guest');
      expect(rbac.can('guest', 'foo', 'read')).toEqual(false);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toBeUndefined();
    });
    it('wildcard:can:false #3', () => {
      const rbac = new RBACModule({
        roles: {
          guest: {
            can: ['foo:read'],
          },
        },
      });
      expect(rbac.can('guest', 'foo', 'read')).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toEqual(true);
      rbac.remove('guest', '*', 'read');
      expect(rbac.can('guest', 'foo', 'read')).toEqual(false);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toBeUndefined();
    });
    it('wildcard:can:false #4', () => {
      const rbac = new RBACModule({
        roles: {
          guest: {
            can: ['*:read'],
          },
        },
      });
      expect(rbac.can('guest', 'foo', 'read')).toEqual(true);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toEqual(true);
      rbac.remove('guest', '*', 'read');
      expect(rbac.can('guest', 'foo', 'read')).toEqual(false);
      expect(rbac['_rulesCompiled']['guest:foo:read']).toBeUndefined();
    });
    it('hierarchical:can:false', () => {
      const rbac = new RBACModule({
        roles: {
          guest: {
            can: ['foo:read'],
          },
          user: {
            can: ['foo:update'],
            inherits: ['guest']
          }
        },
      });
      expect(rbac.can('user', 'foo', 'read')).toEqual(true);
      expect(rbac['_rulesCompiled']['user:foo:read']).toEqual(true);
      rbac.remove('guest', 'foo', 'read');
      expect(rbac.can('user', 'foo', 'read')).toEqual(false);
      expect(rbac['_rulesCompiled']['user:foo:read']).toBeUndefined();
    });
  });
});
