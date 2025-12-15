import { combine, createEffect, createEvent, createStore, sample } from "effector";
import { debounce } from "patronum/debounce";
import type { LorebookDetails, LorebookSummary } from "@/shared/types/lorebooks";
import { getLorebook, getLorebooks, updateLorebook } from "@/shared/api/lorebooks";
import { $lorebook, lorebookChanged } from "./model.form";

// -------- Picker --------
export const lorebookPickerQueryChanged = createEvent<string>();
export const lorebookPicked = createEvent<string>();

const loadLorebooksFx = createEffect<
  { query: string },
  LorebookSummary[],
  Error
>(async ({ query }) => {
  return await getLorebooks({
    name: query.trim().length > 0 ? query.trim() : undefined,
    limit: 25,
    offset: 0,
  });
});

const pickLorebookFx = createEffect<string, LorebookDetails, Error>(async (id) => {
  return await getLorebook(id);
});

export const $lorebookPickerQuery = createStore("")
  .on(lorebookPickerQueryChanged, (_, q) => q);

export const $lorebookPickerLoading = combine(
  loadLorebooksFx.pending,
  pickLorebookFx.pending,
  (a, b) => a || b
);

export const $lorebookPickerItems = createStore<LorebookSummary[]>([])
  .on(loadLorebooksFx.doneData, (_, items) => items);

const debouncedPickerQuery = debounce({
  source: lorebookPickerQueryChanged,
  timeout: 250,
});

sample({
  clock: debouncedPickerQuery,
  fn: (query) => ({ query }),
  target: loadLorebooksFx,
});

sample({
  clock: lorebookPicked,
  target: pickLorebookFx,
});

sample({
  clock: pickLorebookFx.doneData,
  target: lorebookChanged,
});

// Prefill query when lorebook changes (only if user hasn't typed)
sample({
  clock: $lorebook.updates,
  source: $lorebookPickerQuery,
  filter: (q, lb) => q.trim().length === 0 && Boolean(lb && (lb.name ?? "").trim().length > 0),
  fn: (_, lb) => (lb?.name ?? "").trim(),
  target: lorebookPickerQueryChanged,
});

// -------- Editor UI state --------
export const lorebookEditModeChanged = createEvent<"copy" | "shared">();
export const lorebookEntrySearchChanged = createEvent<string>();
export const lorebookPageChanged = createEvent<number>();
export const lorebookPageSizeChanged = createEvent<number>();
export const lorebookToggleEntryExpanded = createEvent<number>();
export const lorebookCollapseAll = createEvent<void>();

export const $lorebookEditMode = createStore<"copy" | "shared">("copy")
  .on(lorebookEditModeChanged, (_, v) => v);

export const $lorebookEntrySearch = createStore("")
  .on(lorebookEntrySearchChanged, (_, v) => v);

export const $lorebookPage = createStore(1)
  .on(lorebookPageChanged, (_, v) => v)
  .reset(lorebookEntrySearchChanged, lorebookPageSizeChanged);

export const $lorebookPageSize = createStore(25)
  .on(lorebookPageSizeChanged, (_, v) => v)
  .reset(lorebookEntrySearchChanged);

export const $lorebookExpanded = createStore<Record<number, boolean>>({})
  .on(lorebookToggleEntryExpanded, (st, idx) => ({ ...st, [idx]: !st[idx] }))
  .reset(lorebookCollapseAll);

// -------- Shared-save (DB) --------
export const saveLorebookSharedClicked = createEvent<void>();

export const saveLorebookSharedFx = createEffect<
  { id: string; data: unknown },
  LorebookDetails,
  Error
>(async ({ id, data }) => {
  return await updateLorebook({ id, data });
});

export const $isSavingSharedLorebook = saveLorebookSharedFx.pending;

sample({
  clock: saveLorebookSharedClicked,
  source: { lb: $lorebook, mode: $lorebookEditMode },
  filter: ({ lb, mode }) => mode === "shared" && Boolean(lb?.id && lb.id.trim().length > 0),
  fn: ({ lb }) => ({ id: (lb as LorebookDetails).id, data: (lb as LorebookDetails).data }),
  target: saveLorebookSharedFx,
});

sample({
  clock: saveLorebookSharedFx.doneData,
  target: lorebookChanged,
});


