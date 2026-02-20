/**
 * Lambda calculus combinator birds — deterministic assignment per person name.
 */

const BIRDS = [
  { name: "bluebird", file: "bluebird.jpg" },
  { name: "mockingbird", file: "mockingbird.jpg" },
  { name: "blackbird", file: "blackbird.jpg" },
  { name: "kitebird", file: "kitebird.jpg" },
  { name: "cardinalbird", file: "cardinalbird.jpg" },
  { name: "kestrelbird", file: "kestrelbird.jpg" },
] as const;

export type Bird = (typeof BIRDS)[number];

export function getBirdForName(name: string): Bird {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  return BIRDS[((h >>> 0) % BIRDS.length + BIRDS.length) % BIRDS.length];
}
