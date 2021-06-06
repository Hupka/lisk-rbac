/* eslint-disable @typescript-eslint/require-await */
import {mergeRoles, flatten} from '../../../src/rbac-algorithm/algorithm-utils';

describe('utils', () => {
  describe('mergeRoles', () => {
    const foo = {
      a: 1,
      b: {
        c: 1,
        d: 2,
      },
    };

    const bar = {
      a: 2,
      b: {
        d: 3,
        e: 4,
      },
    };

    const foobar = {
      a: 2,
      b: {
        c: 1,
        d: 3,
        e: 4,
      },
    };
    it('merges object', async () => {
      expect(mergeRoles({}, foo, bar)).toEqual(foobar);
    });
  });
  describe('flatten', () => {
    const foo = {
      a: {
        b: {
          c: 1,
          d: {
            e: 2,
          },
        },
        f: 3,
      },
      g: 4,
    };

    const fooFlat = {
      'a.b.c': 1,
      'a.b.d.e': 2,
      'a.f': 3,
      g: 4,
    };

    const fooFlatSep = {
      'a:b:c': 1,
      'a:b:d:e': 2,
      'a:f': 3,
      g: 4,
    };

    const invalid = {
      a: undefined,
      b: null,
    };

    it('default separator', async () => {
      expect(flatten(foo)).toEqual(fooFlat);
    });

    it('custom separator', async () => {
      expect(flatten(foo, ':')).toEqual(fooFlatSep);
    });

    it('invalid object', async () => {
      expect(flatten(invalid)).toEqual(invalid);
    });
  });
});
