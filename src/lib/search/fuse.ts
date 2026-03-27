import Fuse from "fuse.js";
import type { RehberMeta } from "@/lib/content/rehber";

let fuseInstance: Fuse<RehberMeta> | null = null;

export function getSearchIndex(rehberler: RehberMeta[]) {
  if (!fuseInstance) {
    fuseInstance = new Fuse(rehberler, {
      keys: [
        { name: "baslik", weight: 0.6 },
        { name: "ozet", weight: 0.3 },
        { name: "etiketler", weight: 0.1 },
      ],
      threshold: 0.35,
      includeScore: true,
    });
  }
  return fuseInstance;
}

export function searchRehberler(
  rehberler: RehberMeta[],
  query: string
): RehberMeta[] {
  if (!query.trim()) return rehberler;
  const fuse = getSearchIndex(rehberler);
  return fuse.search(query).map((r) => r.item);
}
