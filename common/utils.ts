export function maxByFn(array, fn) {
  return array.reduce((r, a) => (fn(a) > fn(r) ? a : r));
}

export function minByFn(array, fn) {
  return array.reduce((r, a) => (fn(a) < fn(r) ? a : r));
}
