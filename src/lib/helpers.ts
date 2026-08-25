export function toNumberOrNull(val: string) {
  return val === "" ? null : Number(val);
}
