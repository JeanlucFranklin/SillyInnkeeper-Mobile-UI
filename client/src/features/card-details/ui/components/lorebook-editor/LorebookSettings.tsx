import { Checkbox, Group, NumberInput, Paper, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Lorebook } from "@/shared/types/lorebooks";

export function LorebookSettings({
  disabled,
  data,
  onChange,
}: {
  disabled?: boolean;
  data: Lorebook;
  onChange: (updater: (data: Lorebook) => Lorebook) => void;
}) {
  const { t } = useTranslation();

  return (
    <Paper p="md">
      <Stack gap="md">
        <Text fw={600}>{t("cardDetails.lorebook.settings", "Lorebook Settings")}</Text>

        <TextInput
          label={t("cardDetails.lorebook.name", "Name")}
          value={data.name ?? ""}
          onChange={(e) =>
            onChange((d) => ({
              ...d,
              name: e.currentTarget.value.trim() || undefined,
            }))
          }
          disabled={disabled}
          placeholder={t("cardDetails.lorebook.namePlaceholder", "Optional lorebook name")}
        />

        <Textarea
          label={t("cardDetails.lorebook.description", "Description")}
          value={data.description ?? ""}
          onChange={(e) =>
            onChange((d) => ({
              ...d,
              description: e.currentTarget.value.trim() || undefined,
            }))
          }
          disabled={disabled}
          minRows={2}
          placeholder={t("cardDetails.lorebook.descriptionPlaceholder", "Optional description")}
        />

        <Group grow>
          <NumberInput
            label={t("cardDetails.lorebook.scanDepth", "Scan Depth")}
            value={data.scan_depth ?? ""}
            onChange={(value) =>
              onChange((d) => ({
                ...d,
                scan_depth: typeof value === "number" && Number.isFinite(value) ? value : undefined,
              }))
            }
            disabled={disabled}
            placeholder={t("cardDetails.lorebook.useGlobal", "Use global")}
            min={0}
          />

          <NumberInput
            label={t("cardDetails.lorebook.tokenBudget", "Token Budget")}
            value={data.token_budget ?? ""}
            onChange={(value) =>
              onChange((d) => ({
                ...d,
                token_budget: typeof value === "number" && Number.isFinite(value) ? value : undefined,
              }))
            }
            disabled={disabled}
            placeholder={t("cardDetails.lorebook.useGlobal", "Use global")}
            min={0}
          />
        </Group>

        <Checkbox
          label={t("cardDetails.lorebook.recursiveScanning", "Recursive Scanning")}
          checked={data.recursive_scanning ?? false}
          onChange={(e) =>
            onChange((d) => ({
              ...d,
              recursive_scanning: e.currentTarget.checked || undefined,
            }))
          }
          disabled={disabled}
        />
      </Stack>
    </Paper>
  );
}


