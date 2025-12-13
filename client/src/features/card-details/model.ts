import { combine, createEffect, createEvent, createStore, sample } from "effector";
import { getCardDetails } from "@/shared/api/cards";
import type { CardDetails } from "@/shared/types/cards";

type LoadParams = { requestId: number; id: string };
type LoadResult = { requestId: number; details: CardDetails };

const loadDetailsInternalFx = createEffect<LoadParams, LoadResult, Error>(
  async ({ requestId, id }) => {
    const details = await getCardDetails(id);
    return { requestId, details };
  }
);

// Stores
export const $openedId = createStore<string | null>(null);
export const $details = createStore<CardDetails | null>(null);
export const $error = createStore<string | null>(null);
const $lastRequestId = createStore(0);

export const $isLoading = combine(loadDetailsInternalFx.pending, (p) => p);

// Events
export const openCard = createEvent<string>();
export const closeCard = createEvent<void>();

const setDetails = createEvent<CardDetails | null>();
const setError = createEvent<string | null>();

$openedId.on(openCard, (_, id) => id).reset(closeCard);
$details.on(setDetails, (_, d) => d).reset(closeCard);
$error.on(setError, (_, e) => e).reset(closeCard);
$lastRequestId.on(loadDetailsInternalFx, (_, p) => p.requestId).reset(closeCard);

// Trigger effect with takeLatest semantics
sample({
  clock: openCard,
  source: $lastRequestId,
  fn: (lastId, id): LoadParams => ({ requestId: lastId + 1, id }),
  target: loadDetailsInternalFx,
});

sample({
  clock: loadDetailsInternalFx.doneData,
  source: $lastRequestId,
  filter: (lastId, done) => done.requestId === lastId,
  fn: (_, done) => done.details,
  target: setDetails,
});

sample({
  clock: loadDetailsInternalFx.doneData,
  fn: () => null,
  target: setError,
});

sample({
  clock: loadDetailsInternalFx.failData,
  fn: (error: Error) => error.message,
  target: setError,
});

// keep backward-compatible export name if needed later
export const loadCardDetailsFx = loadDetailsInternalFx;


