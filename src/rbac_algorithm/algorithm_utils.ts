/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Much of the algorithm is credited to https://gitlab.com/m03geek/fast-rbac/-/tree/master. 
 */
export function flatten(
  object: { [key: string]: any },
  separator = '.'
): { [key: string]: any } {
  const isValidObject = (value: any): boolean => {
    if (!value) {
      return false;
    }

    const isArray = Array.isArray(value);
    const isBuffer = Buffer.isBuffer(value);
    const isΟbject =
      Object.prototype.toString.call(value) === '[object Object]';
    const hasKeys = !!Object.keys(value).length;

    return !isArray && !isBuffer && isΟbject && hasKeys;
  };

  const walker = (
    child: { [key: string]: any },
    path: Array<string> = []
  ): any =>
    Object.assign(
      {},
      ...Object.keys(child).map((key) =>
        isValidObject(child[key])
          ? walker(child[key], path.concat([key]))
          : { [path.concat([key]).join(separator)]: child[key] }
      )
    )
    ;

  return { ...walker(object) };
}

export function mergeRoles(
  dst: { [key: string]: any },
  ...srcs: Array<{ [key: string]: any }>
): { [key: string]: any } {
  for (const src of srcs) {
    for (const [key, val] of Object.entries(src)) {
      if (typeof val === 'object') {
        dst[key] = { ...dst[key], ...val };
      } else {
        dst[key] = val;
      }
    }
  }

  return dst;
}
