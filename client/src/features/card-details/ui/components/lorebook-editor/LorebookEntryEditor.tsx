import { Stack } from "@mantine/core";
import type { LorebookEntry } from "@/shared/types/lorebooks";
import { getStExt } from "@/shared/types/lorebooks/sillytavern";
import { EntryAdvancedAccordion } from "./entry-editor/entry-advanced-accordion";
import { EntryBasicFields } from "./entry-editor/entry-basic-fields";

export function LorebookEntryEditor({
  entry,
  index,
  disabled,
  onUpdate,
}: {
  entry: LorebookEntry;
  index: number;
  disabled?: boolean;
  onUpdate: (updater: (entry: LorebookEntry) => LorebookEntry) => void;
}) {
  const st = getStExt(entry).entry ?? {};

  const resetKeyBase = `${index}:${entry.insertion_order}:${
    entry.enabled ? 1 : 0
  }`;

  return (
    <Stack gap="xs" mt="xs">
      <EntryBasicFields
        entry={entry}
        disabled={disabled}
        st={st}
        resetKeyBase={resetKeyBase}
        onUpdate={onUpdate}
      />

      <EntryAdvancedAccordion
        entry={entry}
        disabled={disabled}
        st={st}
        resetKeyBase={resetKeyBase}
        onUpdate={onUpdate}
      />
    </Stack>
  );
}
