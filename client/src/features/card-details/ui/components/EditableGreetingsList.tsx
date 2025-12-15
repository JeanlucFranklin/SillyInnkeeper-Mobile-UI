import {
  ActionIcon,
  Badge,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import type { Store } from "effector";
import { useStoreMap } from "effector-react";
import { useTranslation } from "react-i18next";
import { MdTextareaField } from "./MdTextareaField";

function GreetingRow({
  id,
  idx,
  valuesStore,
  onChangeValue,
  onDuplicate,
  onDelete,
  resetKey,
}: {
  id: string;
  idx: number;
  valuesStore: Store<Record<string, string>>;
  onChangeValue: (id: string, next: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  resetKey?: string | number;
}) {
  const { t } = useTranslation();
  const value = useStoreMap({
    store: valuesStore,
    keys: [id],
    fn: (values, [key]) => values[key] ?? "",
  });

  return (
    <MdTextareaField
      key={`${id}-${resetKey ?? "k"}`}
      label={`#${idx + 1}`}
      minRows={6}
      resetKey={`${resetKey ?? ""}:${id}`}
      value={value}
      onChange={(next) => onChangeValue(id, next)}
      extraActions={
        <Group gap={6} wrap="nowrap">
          <Tooltip label={t("cardDetails.duplicateField")} withArrow>
            <ActionIcon
              variant="light"
              aria-label={t("cardDetails.duplicateField")}
              onClick={() => onDuplicate(id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t("cardDetails.deleteField")} withArrow>
            <ActionIcon
              variant="light"
              color="red"
              aria-label={t("cardDetails.deleteField")}
              onClick={() => onDelete(id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </ActionIcon>
          </Tooltip>
        </Group>
      }
    />
  );
}

export function EditableGreetingsList({
  title,
  ids,
  valuesStore,
  onChangeValue,
  onAdd,
  onDuplicate,
  onDelete,
  resetKey,
}: {
  title: string;
  ids: string[];
  valuesStore: Store<Record<string, string>>;
  onChangeValue: (id: string, next: string) => void;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  resetKey?: string | number;
}) {
  const { t } = useTranslation();

  return (
    <Paper p="md">
      <Group justify="space-between" align="center" mb="sm">
        <Group gap={8}>
          <Text size="sm" fw={600}>
            {title}
          </Text>
          <Badge variant="light" color="gray">
            {(ids ?? []).length}
          </Badge>
        </Group>

        <Tooltip label={t("cardDetails.addField")} withArrow>
          <ActionIcon
            variant="light"
            color="indigo"
            onClick={onAdd}
            aria-label={t("cardDetails.addField")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </ActionIcon>
        </Tooltip>
      </Group>

      {(ids ?? []).length === 0 ? (
        <Text c="dimmed">{t("empty.dash")}</Text>
      ) : (
        <Stack gap="md">
          {ids.map((id, idx) => (
            <GreetingRow
              key={id}
              id={id}
              idx={idx}
              valuesStore={valuesStore}
              onChangeValue={onChangeValue}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              resetKey={resetKey}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}
