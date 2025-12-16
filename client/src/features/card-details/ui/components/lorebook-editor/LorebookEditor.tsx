import { useMemo } from "react";
import { useUnit } from "effector-react";
import { useTranslation } from "react-i18next";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import type {
  Lorebook,
  LorebookDetails,
  LorebookEntry,
} from "@/shared/types/lorebooks";
import {
  $lorebook,
  lorebookChanged,
  lorebookCleared,
} from "../../../model.form";
import {
  $isSavingSharedLorebook,
  $lorebookEditMode,
  saveLorebookSharedClicked,
} from "../../../model.lorebook-editor";
import { LorebookPicker } from "./LorebookPicker";
import { LorebookEntries } from "./LorebookEntries";
import { LorebookSettings } from "./LorebookSettings";

function createEmptyEntry(): LorebookEntry {
  return {
    keys: [],
    content: "",
    extensions: {},
    enabled: true,
    insertion_order: 0,
    use_regex: false,
  };
}

function ensureLorebookStructure(data: unknown): Lorebook {
  const isPlainObject = (v: unknown): v is Record<string, any> =>
    Boolean(v) && typeof v === "object" && !Array.isArray(v);

  const normalizeEntry = (raw: unknown): LorebookEntry => {
    if (!isPlainObject(raw)) return createEmptyEntry();

    const keysOk =
      Array.isArray(raw.keys) &&
      raw.keys.every((k: unknown) => typeof k === "string");
    const contentOk = typeof raw.content === "string";
    const extensionsOk = isPlainObject(raw.extensions);
    const enabledOk = typeof raw.enabled === "boolean";
    const insertionOrderOk = typeof raw.insertion_order === "number";
    const useRegexOk = typeof raw.use_regex === "boolean";

    // Fast path: keep reference to avoid re-rendering all entries on each change.
    if (
      keysOk &&
      contentOk &&
      extensionsOk &&
      enabledOk &&
      insertionOrderOk &&
      useRegexOk
    ) {
      return raw as LorebookEntry;
    }

    return {
      ...createEmptyEntry(),
      ...raw,
      keys: Array.isArray(raw.keys)
        ? raw.keys.filter((k) => typeof k === "string")
        : [],
      content: typeof raw.content === "string" ? raw.content : "",
      extensions: isPlainObject(raw.extensions) ? raw.extensions : {},
      enabled: typeof raw.enabled === "boolean" ? raw.enabled : true,
      insertion_order:
        typeof raw.insertion_order === "number" ? raw.insertion_order : 0,
      use_regex: typeof raw.use_regex === "boolean" ? raw.use_regex : false,
    };
  };

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      extensions: {},
      entries: [],
    };
  }

  const lb = data as Partial<Lorebook>;
  return {
    name: lb.name,
    description: lb.description,
    scan_depth: lb.scan_depth,
    token_budget: lb.token_budget,
    recursive_scanning: lb.recursive_scanning,
    extensions:
      lb.extensions &&
      typeof lb.extensions === "object" &&
      !Array.isArray(lb.extensions)
        ? (lb.extensions as Record<string, any>)
        : {},
    entries: Array.isArray(lb.entries) ? lb.entries.map(normalizeEntry) : [],
  };
}

export function LorebookEditor({
  openedId,
  disabled = false,
}: {
  openedId: string | null;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  const [
    lorebook,
    changeLorebook,
    clearLorebook,
    editMode,
    saveShared,
    isSavingShared,
  ] = useUnit([
    $lorebook,
    lorebookChanged,
    lorebookCleared,
    $lorebookEditMode,
    saveLorebookSharedClicked,
    $isSavingSharedLorebook,
  ]);

  const lorebookData = useMemo(() => {
    if (!lorebook?.data) return ensureLorebookStructure(null);
    return ensureLorebookStructure(lorebook.data);
  }, [lorebook?.data]);

  const updateLorebookData = (updater: (data: Lorebook) => Lorebook) => {
    if (!lorebook) return;
    const updated = updater(lorebookData);
    changeLorebook({ ...lorebook, data: updated });
  };

  const updateEntry = (
    index: number,
    updater: (entry: LorebookEntry) => LorebookEntry
  ) => {
    updateLorebookData((data) => {
      const entries = [...data.entries];
      entries[index] = updater(entries[index] || createEmptyEntry());
      return { ...data, entries };
    });
  };

  const addEntry = () => {
    updateLorebookData((data) => {
      const newEntry = {
        ...createEmptyEntry(),
        insertion_order: data.entries.length,
      };
      return { ...data, entries: [...data.entries, newEntry] };
    });
  };

  const deleteEntry = (index: number) => {
    updateLorebookData((data) => {
      const remaining = data.entries.filter((_, idx) => idx !== index);
      const entries = remaining.map((entry, idx) =>
        entry.insertion_order === idx
          ? entry
          : { ...entry, insertion_order: idx }
      );
      return { ...data, entries };
    });
  };

  const duplicateEntry = (index: number) => {
    updateLorebookData((data) => {
      const entries = [...data.entries];
      const entry = entries[index];
      if (!entry) return data;
      const duplicated = { ...entry, extensions: { ...entry.extensions } };
      duplicated.insertion_order = entries.length;
      entries.push(duplicated);
      return { ...data, entries };
    });
  };

  const moveEntry = (index: number, direction: "up" | "down") => {
    updateLorebookData((data) => {
      const entries = data.entries;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= entries.length) return data;

      const a = entries[index];
      const b = entries[newIndex];
      if (!a || !b) return data;

      const next = entries.slice();
      next[index] = { ...b, insertion_order: index };
      next[newIndex] = { ...a, insertion_order: newIndex };
      return { ...data, entries: next };
    });
  };

  const handleCreateNew = () => {
    const emptyLorebook: LorebookDetails = {
      id: "",
      name: null,
      description: null,
      spec: "lorebook_v3",
      created_at: 0,
      updated_at: 0,
      data: ensureLorebookStructure(null),
      cards: [],
    };
    changeLorebook(emptyLorebook);
  };

  if (!lorebook) {
    return (
      <Paper p="md">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t(
              "cardDetails.lorebook.noLorebook",
              "No lorebook attached to this card."
            )}
          </Text>
          <Group>
            <Button onClick={handleCreateNew} disabled={disabled}>
              {t("cardDetails.lorebook.createNew", "Create New Lorebook")}
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <LorebookPicker
        disabled={disabled}
        onCreateNew={handleCreateNew}
        onClear={clearLorebook}
      />

      <LorebookSettings
        disabled={disabled}
        data={lorebookData}
        onChange={updateLorebookData}
      />

      <LorebookEntries
        disabled={disabled}
        entries={lorebookData.entries}
        onAdd={addEntry}
        onUpdateEntry={updateEntry}
        onDeleteEntry={deleteEntry}
        onDuplicateEntry={duplicateEntry}
        onMoveEntry={moveEntry}
      />

      <Paper p="md">
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            {editMode === "shared"
              ? t(
                  "cardDetails.lorebook.saveHintShared",
                  "In Shared mode, use “Save Lorebook” to persist to the lorebooks database."
                )
              : t(
                  "cardDetails.lorebook.saveHint",
                  "Changes are saved with the card. Use the main “Save” button in Actions."
                )}
          </Text>
          <Group>
            <Button
              onClick={() => saveShared()}
              disabled={
                disabled ||
                editMode !== "shared" ||
                isSavingShared ||
                !lorebook?.id
              }
              loading={isSavingShared}
              variant="light"
            >
              {t("cardDetails.lorebook.save", "Save Lorebook")}
            </Button>
            <Button
              variant="light"
              onClick={handleCreateNew}
              disabled={disabled}
            >
              {t("cardDetails.lorebook.createNew", "Create New")}
            </Button>
            <Button
              variant="subtle"
              color="red"
              onClick={clearLorebook}
              disabled={disabled}
            >
              {t("cardDetails.lorebook.clear", "Clear")}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
