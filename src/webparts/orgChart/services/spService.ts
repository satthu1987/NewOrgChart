// spService.ts — initialize PnPjs and expose simple helpers to fetch list items
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";
import "@pnp/sp/lists";
import "@pnp/sp/items";

let sp: SPFI | undefined;

/**
 * Initialize pnp/sp for this SPFx context. Call from web part onInit.
 */
export function initSp(context: any) {
  sp = spfi().using(SPFx(context));
}

/**
 * Fetch items from a list (OrgChart). Returns raw array of items.
 * Selects and expands Manager lookup so we can read Manager.Id safely.
 */
export async function getOrgItems(listTitle: string) {
  if (!sp) throw new Error('PnPJS not initialized. Call initSp(context) first.');

  // Select the fields we need and expand the Manager lookup
  // Note: PnP v3 executes the chain with () at the end
  const items = await sp.web.lists
    .getByTitle(listTitle)
    .items
    .select(
      'Id',
      'Title',
      'JobTitle',
      'SortOrder',
      'PageUrl',
      'ShowPhoto',
      'Branch',
      'PhotoUrl',
      'IsLeaf',
      'Manager/Id'     // expand Manager so we can read Manager.Id
    )
    .expand('Manager')
    .orderBy('SortOrder', true)();

  return items;
}