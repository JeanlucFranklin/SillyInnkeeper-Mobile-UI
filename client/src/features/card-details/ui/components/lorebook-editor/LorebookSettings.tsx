import {
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Lorebook } from "@/shared/types/lorebooks";

export function LorebookSettings({
  disabled,
  data,
  onChange,
  variant = "standalone",
}: {
  disabled?: boolean;
  data: Lorebook;
  onChange: (updater: (data: Lorebook) => Lorebook) => void;
  variant?: "standalone" | "panel";
}) {
  const { t } = useTranslation();

  const size = variant === "panel" ? "xs" : "sm";
  const stack = (
    <Stack gap={variant === "panel" ? "xs" : "md"}>
      {variant === "standalone" ? (
        <Text fw={600}>
          {t("cardDetails.lorebook.settings", "Lorebook Settings")}
        </Text>
      ) : null}

      <TextInput
        label={
          variant === "standalone"
            ? t("cardDetails.lorebook.name", "Name")
            : undefined
        }
        value={data.name ?? ""}
        onChange={(e) =>
          onChange((d) => ({
            ...d,
            name: e.currentTarget.value.trim() || undefined,
          }))
        }
        disabled={disabled}
        placeholder={t(
          "cardDetails.lorebook.namePlaceholder",
          "Optional lorebook name"
        )}
        size={size}
      />

      <Textarea
        label={
          variant === "standalone"
            ? t("cardDetails.lorebook.description", "Description")
            : undefined
        }
        value={data.description ?? ""}
        onChange={(e) =>
          onChange((d) => ({
            ...d,
            description: e.currentTarget.value.trim() || undefined,
          }))
        }
        disabled={disabled}
        minRows={variant === "panel" ? 1 : 2}
        autosize
        size={size}
        placeholder={t(
          "cardDetails.lorebook.descriptionPlaceholder",
          "Optional description"
        )}
      />

      <Group grow gap="xs">
        <NumberInput
          label={
            variant === "standalone"
              ? t("cardDetails.lorebook.scanDepth", "Scan Depth")
              : undefined
          }
          value={data.scan_depth ?? ""}
          onChange={(value) =>
            onChange((d) => ({
              ...d,
              scan_depth:
                typeof value === "number" && Number.isFinite(value)
                  ? value
                  : undefined,
            }))
          }
          disabled={disabled}
          placeholder={t("cardDetails.lorebook.useGlobal", "Use global")}
          min={0}
          size={size}
        />

        <NumberInput
          label={
            variant === "standalone"
              ? t("cardDetails.lorebook.tokenBudget", "Token Budget")
              : undefined
          }
          value={data.token_budget ?? ""}
          onChange={(value) =>
            onChange((d) => ({
              ...d,
              token_budget:
                typeof value === "number" && Number.isFinite(value)
                  ? value
                  : undefined,
            }))
          }
          disabled={disabled}
          placeholder={t("cardDetails.lorebook.useGlobal", "Use global")}
          min={0}
          size={size}
        />
      </Group>

      <Checkbox
        label={t(
          "cardDetails.lorebook.recursiveScanning",
          "Recursive Scanning"
        )}
        checked={data.recursive_scanning ?? false}
        onChange={(e) =>
          onChange((d) => ({
            ...d,
            recursive_scanning: e.currentTarget.checked || undefined,
          }))
        }
        disabled={disabled}
        size={size}
      />
    </Stack>
  );

  if (variant === "panel") return stack;

  return <Paper p="md">{stack}</Paper>;
}
