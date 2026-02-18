/**
 * Lambda calculus combinator birds — deterministic assignment per person name.
 */

const BIRDS = [
  { name: "bluebird", file: "bluebird.svg" },
  { name: "mockingbird", file: "mockingbird.svg" },
  { name: "blackbird", file: "blackbird.svg" },
  { name: "kitebird", file: "kitebird.svg" },
  { name: "cardinalbird", file: "cardinalbird.svg" },
  { name: "kestrelbird", file: "kestrelbird.svg" },
] as const;

export type Bird = (typeof BIRDS)[number];

export function getBirdForName(name: string): Bird {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  return BIRDS[((h >>> 0) % BIRDS.length + BIRDS.length) % BIRDS.length];
}
