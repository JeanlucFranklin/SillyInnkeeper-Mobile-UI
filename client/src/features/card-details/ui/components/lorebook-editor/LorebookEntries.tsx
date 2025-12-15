import { useMemo } from "react";
import { useUnit } from "effector-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import type { LorebookEntry } from "@/shared/types/lorebooks";
import {
  $lorebookEntrySearch,
  $lorebookPage,
  $lorebookPageSize,
  lorebookEntrySearchChanged,
  lorebookPageChanged,
  lorebookPageSizeChanged,
} from "../../../model.lorebook-editor";
import { LorebookEntryCard } from "./LorebookEntryCard";

export function LorebookEntries({
  disabled,
  entries,
  onAdd,
  onUpdateEntry,
  onDeleteEntry,
  onDuplicateEntry,
  onMoveEntry,
}: {
  disabled?: boolean;
  entries: LorebookEntry[];
  onAdd: () => void;
  onUpdateEntry: (index: number, updater: (entry: LorebookEntry) => LorebookEntry) => void;
  onDeleteEntry: (index: number) => void;
  onDuplicateEntry: (index: number) => void;
  onMoveEntry: (index: number, dir: "up" | "down") => void;
}) {
  const { t } = useTranslation();
  const [search, setSearch, page, setPage, pageSize, setPageSize] = useUnit([
    $lorebookEntrySearch,
    lorebookEntrySearchChanged,
    $lorebookPage,
    lorebookPageChanged,
    $lorebookPageSize,
    lorebookPageSizeChanged,
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = entries.map((entry, index) => ({ entry, index }));
    if (!q) return items;
    return items.filter(({ entry, index }) => {
      const title = (entry.name ?? "").toString().toLowerCase();
      const keys = (entry.keys ?? []).join(",").toLowerCase();
      const content = (entry.content ?? "").toLowerCase();
      const idx = String(index + 1);
      return title.includes(q) || keys.includes(q) || content.includes(q) || idx === q;
    });
  }, [entries, search]);

  const paged = useMemo(() => {
    const safePageSize = Math.max(1, Math.min(200, Math.trunc(pageSize)));
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const safePage = Math.max(1, Math.min(totalPages, Math.trunc(page)));
    const start = (safePage - 1) * safePageSize;
    const end = start + safePageSize;
    return {
      items: filtered.slice(start, end),
      total,
      totalPages,
      page: safePage,
      pageSize: safePageSize,
    };
  }, [filtered, page, pageSize]);

  return (
    <Paper p="md">
      <Group justify="space-between" mb="md" align="flex-end">
        <Stack gap={4}>
          <Text fw={600}>
            {t("cardDetails.lorebook.entries", "Entries")} ({entries.length})
          </Text>
          <Text size="xs" c="dimmed">
            {t("cardDetails.lorebook.entriesHint", "Search, reorder, and configure entries")}
          </Text>
        </Stack>
        <Button onClick={onAdd} disabled={disabled} size="sm">
          {t("cardDetails.lorebook.addEntry", "Add Entry")}
        </Button>
      </Group>

      <Group mb="md" align="flex-end">
        <TextInput
          label={t("cardDetails.lorebook.searchEntries", "Search")}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder={t("cardDetails.lorebook.searchEntriesPlaceholder", "Title, keys, content…")}
          disabled={disabled}
          style={{ flex: 1 }}
        />
        <Select
          label={t("cardDetails.lorebook.pageSize", "Per page")}
          value={String(pageSize)}
          onChange={(v) => setPageSize(Number(v ?? 25))}
          data={[
            { value: "10", label: "10" },
            { value: "25", label: "25" },
            { value: "50", label: "50" },
            { value: "100", label: "100" },
          ]}
          disabled={disabled}
          w={120}
        />
        <NumberInput
          label={t("cardDetails.lorebook.page", "Page")}
          value={paged.page}
          onChange={(v) => setPage(typeof v === "number" && Number.isFinite(v) ? v : 1)}
          min={1}
          max={paged.totalPages}
          disabled={disabled}
          w={120}
        />
      </Group>

      <Group justify="space-between" mb="xs">
        <Text size="xs" c="dimmed">
          {t("cardDetails.lorebook.showing", "Showing")}{" "}
          {paged.total === 0
            ? "0"
            : `${(paged.page - 1) * paged.pageSize + 1}-${Math.min(
                paged.page * paged.pageSize,
                paged.total
              )}`}{" "}
          {t("cardDetails.lorebook.of", "of")} {paged.total}
        </Text>
        <Text size="xs" c="dimmed">
          {t("cardDetails.lorebook.sortHint", "Tip: use the arrows to change order")}
        </Text>
      </Group>

      {entries.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          {t("cardDetails.lorebook.noEntries", "No entries yet. Add one to get started.")}
        </Text>
      ) : paged.total === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          {t("cardDetails.lorebook.noSearchResults", "No entries match your search.")}
        </Text>
      ) : (
        <Stack gap="md">
          {paged.items.map(({ entry, index }) => (
            <LorebookEntryCard
              key={index}
              index={index}
              entry={entry}
              totalEntries={entries.length}
              disabled={disabled}
              onUpdate={(updater) => onUpdateEntry(index, updater)}
              onDelete={() => onDeleteEntry(index)}
              onDuplicate={() => onDuplicateEntry(index)}
              onMove={(dir) => onMoveEntry(index, dir)}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}


