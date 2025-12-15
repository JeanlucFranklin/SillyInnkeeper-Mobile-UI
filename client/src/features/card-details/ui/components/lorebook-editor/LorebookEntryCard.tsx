import { memo, useMemo } from "react";
import { useUnit } from "effector-react";
import { useTranslation } from "react-i18next";
import { ActionIcon, Button, Checkbox, Collapse, Group, Paper, Stack, Text } from "@mantine/core";
import type { LorebookEntry } from "@/shared/types/lorebooks";
import { getStExt } from "@/shared/types/lorebooks/sillytavern";
import { $lorebookExpanded, lorebookToggleEntryExpanded } from "../../../model.lorebook-editor";
import { LorebookEntryEditor } from "./LorebookEntryEditor";

export const LorebookEntryCard = memo(function LorebookEntryCard({
  entry,
  index,
  totalEntries,
  disabled,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
}: {
  entry: LorebookEntry;
  index: number;
  totalEntries: number;
  disabled?: boolean;
  onUpdate: (updater: (entry: LorebookEntry) => LorebookEntry) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const { t } = useTranslation();
  const [expandedMap, toggleExpanded] = useUnit([$lorebookExpanded, lorebookToggleEntryExpanded]);
  const expanded = Boolean(expandedMap[index]);

  const st = useMemo(() => getStExt(entry).entry ?? {}, [entry]);

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Group>
          <Text fw={500}>
            {entry.name || t("cardDetails.lorebook.entry", "Entry")} {index + 1}
          </Text>
          <Checkbox
            label={t("cardDetails.lorebook.enabled", "Enabled")}
            checked={entry.enabled}
            onChange={(ev) => onUpdate((ent) => ({ ...ent, enabled: ev.currentTarget.checked }))}
            disabled={disabled}
          />
        </Group>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            onClick={() => onMove("up")}
            disabled={disabled || index === 0}
            aria-label={t("cardDetails.lorebook.moveUp", "Move up")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </ActionIcon>
          <ActionIcon
            variant="light"
            onClick={() => onMove("down")}
            disabled={disabled || index === totalEntries - 1}
            aria-label={t("cardDetails.lorebook.moveDown", "Move down")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="blue"
            onClick={onDuplicate}
            disabled={disabled}
            aria-label={t("cardDetails.lorebook.duplicate", "Duplicate")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            onClick={onDelete}
            disabled={disabled}
            aria-label={t("cardDetails.lorebook.delete", "Delete")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </ActionIcon>
        </Group>
      </Group>

      {/* Compact summary row */}
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" c="dimmed">
            {t("cardDetails.lorebook.keys", "Keys")}
          </Text>
          <Text size="sm" lineClamp={2}>
            {entry.keys.length > 0 ? entry.keys.join(", ") : t("empty.dash")}
          </Text>
        </Stack>
        <Stack gap={2} w={110}>
          <Text size="xs" c="dimmed">
            {t("cardDetails.lorebook.position", "Position")}
          </Text>
          <Text size="sm">{entry.position ?? t("empty.dash")}</Text>
        </Stack>
        <Stack gap={2} w={90}>
          <Text size="xs" c="dimmed">
            {t("cardDetails.lorebook.insertionOrder", "Insertion Order")}
          </Text>
          <Text size="sm">{String(entry.insertion_order)}</Text>
        </Stack>
        <Stack gap={2} w={90}>
          <Text size="xs" c="dimmed">
            {t("cardDetails.lorebook.priority", "Priority")}
          </Text>
          <Text size="sm">
            {typeof entry.priority === "number" ? String(entry.priority) : t("empty.dash")}
          </Text>
        </Stack>
        <Stack gap={2} w={90}>
          <Text size="xs" c="dimmed">
            {t("cardDetails.lorebook.trigger", "Trigger %")}
          </Text>
          <Text size="sm">
            {typeof st.trigger_percent === "number" ? String(st.trigger_percent) : t("empty.dash")}
          </Text>
        </Stack>
      </Group>

      <Collapse in={expanded}>
        <LorebookEntryEditor
          entry={entry}
          index={index}
          disabled={disabled}
          onUpdate={onUpdate}
        />
      </Collapse>

      <Button
        variant="subtle"
        size="xs"
        mt="sm"
        onClick={() => toggleExpanded(index)}
        leftSection={
          expanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          )
        }
      >
        {expanded
          ? t("cardDetails.lorebook.collapse", "Collapse")
          : t("cardDetails.lorebook.expand", "Expand")}
      </Button>
    </Paper>
  );
});


