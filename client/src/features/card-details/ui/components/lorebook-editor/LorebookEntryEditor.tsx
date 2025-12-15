import { Group, NumberInput, Select, Stack, Text, Textarea, Checkbox, TagsInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { LorebookEntry } from "@/shared/types/lorebooks";
import { clampInt, getStExt, setStEntryExt } from "@/shared/types/lorebooks/sillytavern";
import { DeferredCommaListInput } from "./fields/DeferredCommaListInput";

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
  const { t } = useTranslation();
  const st = getStExt(entry).entry ?? {};

  const resetKeyBase = `${index}:${entry.insertion_order}:${entry.enabled ? 1 : 0}`;

  const triggers = Array.isArray(st.triggers) ? st.triggers : [];
  const additionalSources = Array.isArray(st.additional_matching_sources)
    ? st.additional_matching_sources
    : [];

  return (
    <Stack gap="sm" mt="md">
      <Text fw={600}>{t("cardDetails.lorebook.entryName", "Entry Name")}</Text>

      <Textarea
        label={t("cardDetails.lorebook.entryName", "Entry Name")}
        value={entry.name ?? ""}
        onChange={(ev) =>
          onUpdate((ent) => ({
            ...ent,
            name: ev.currentTarget.value.trim() || undefined,
          }))
        }
        disabled={disabled}
        minRows={1}
        autosize
      />

      {/* Keys: deferred parsing to allow commas (regex, \\,) */}
      <DeferredCommaListInput
        label={t("cardDetails.lorebook.keys", "Keys")}
        placeholder={t("cardDetails.lorebook.keysPlaceholder", "Comma separated list")}
        disabled={disabled}
        values={entry.keys}
        onCommit={(keys) => onUpdate((ent) => ({ ...ent, keys }))}
        resetKey={`${resetKeyBase}:keys:${entry.keys.join("|")}`}
      />

      <Group grow>
        <Checkbox
          label={t("cardDetails.lorebook.selective", "Selective")}
          checked={entry.selective ?? false}
          onChange={(ev) =>
            onUpdate((ent) => ({
              ...ent,
              selective: ev.currentTarget.checked || undefined,
            }))
          }
          disabled={disabled}
        />
        <DeferredCommaListInput
          label={t("cardDetails.lorebook.secondaryKeys", "Secondary Keys")}
          placeholder={t("cardDetails.lorebook.keysPlaceholder", "Comma separated list")}
          disabled={disabled || entry.use_regex}
          values={entry.secondary_keys ?? []}
          onCommit={(secondary) =>
            onUpdate((ent) => ({
              ...ent,
              secondary_keys: secondary.length > 0 ? secondary : undefined,
            }))
          }
          resetKey={`${resetKeyBase}:secondary:${(entry.secondary_keys ?? []).join("|")}`}
        />
      </Group>

      <Textarea
        label={t("cardDetails.lorebook.content", "Content")}
        value={entry.content}
        onChange={(ev) => onUpdate((ent) => ({ ...ent, content: ev.currentTarget.value }))}
        disabled={disabled}
        minRows={4}
      />

      <Group grow>
        <NumberInput
          label={t("cardDetails.lorebook.insertionOrder", "Insertion Order")}
          value={entry.insertion_order}
          onChange={(value) =>
            onUpdate((ent) => ({
              ...ent,
              insertion_order: typeof value === "number" && Number.isFinite(value) ? value : 0,
            }))
          }
          disabled={disabled}
          min={0}
        />
        <NumberInput
          label={t("cardDetails.lorebook.priority", "Priority")}
          value={entry.priority ?? ""}
          onChange={(value) =>
            onUpdate((ent) => ({
              ...ent,
              priority: typeof value === "number" && Number.isFinite(value) ? value : undefined,
            }))
          }
          disabled={disabled}
          placeholder={t("cardDetails.lorebook.optional", "Optional")}
        />
      </Group>

      <Select
        label={t("cardDetails.lorebook.position", "Position")}
        value={entry.position ?? ""}
        onChange={(value) =>
          onUpdate((ent) => ({
            ...ent,
            position:
              value === "before_char" || value === "after_char" ? value : undefined,
          }))
        }
        data={[
          { value: "", label: t("cardDetails.lorebook.optional", "Optional") },
          { value: "before_char", label: t("cardDetails.lorebook.posBeforeChar", "Before Char Defs") },
          { value: "after_char", label: t("cardDetails.lorebook.posAfterChar", "After Char Defs") },
        ]}
        disabled={disabled}
      />

      <Group grow>
        <Checkbox
          label={t("cardDetails.lorebook.useRegex", "Use Regex")}
          checked={entry.use_regex}
          onChange={(ev) => onUpdate((ent) => ({ ...ent, use_regex: ev.currentTarget.checked }))}
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.caseSensitive", "Case Sensitive")}
          checked={entry.case_sensitive ?? false}
          onChange={(ev) =>
            onUpdate((ent) => ({
              ...ent,
              case_sensitive: ev.currentTarget.checked || undefined,
            }))
          }
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.constant", "Constant")}
          checked={entry.constant ?? false}
          onChange={(ev) =>
            onUpdate((ent) => ({
              ...ent,
              constant: ev.currentTarget.checked || undefined,
            }))
          }
          disabled={disabled}
        />
      </Group>

      {/* ST fields */}
      <Text fw={600} mt="sm">
        {t("cardDetails.lorebook.stSection", "SillyTavern fields")}
      </Text>

      <DeferredCommaListInput
        label={t("cardDetails.lorebook.optionalFilter", "Optional Filter")}
        placeholder={t("cardDetails.lorebook.keysPlaceholder", "Comma separated list")}
        disabled={disabled || entry.use_regex}
        values={Array.isArray(st.optional_filter) ? st.optional_filter : []}
        onCommit={(list) =>
          onUpdate((ent) => setStEntryExt(ent, { optional_filter: list.length > 0 ? list : undefined }))
        }
        resetKey={`${resetKeyBase}:opt:${(Array.isArray(st.optional_filter) ? st.optional_filter : []).join("|")}`}
      />

      <Select
        label={t("cardDetails.lorebook.optionalLogic", "Logic")}
        value={typeof st.optional_logic === "string" ? st.optional_logic : "AND_ANY"}
        onChange={(value) => {
          const v =
            value === "AND_ANY" || value === "AND_ALL" || value === "NOT_ANY" || value === "NOT_ALL"
              ? value
              : "AND_ANY";
          onUpdate((ent) => setStEntryExt(ent, { optional_logic: v }));
        }}
        data={[
          { value: "AND_ANY", label: "AND ANY" },
          { value: "AND_ALL", label: "AND ALL" },
          { value: "NOT_ANY", label: "NOT ANY" },
          { value: "NOT_ALL", label: "NOT ALL" },
        ]}
        disabled={disabled || entry.use_regex}
      />

      <Group grow>
        <Checkbox
          label={t("cardDetails.lorebook.wholeWords", "Whole Words")}
          checked={Boolean(st.match_whole_words)}
          onChange={(ev) =>
            onUpdate((ent) => setStEntryExt(ent, { match_whole_words: ev.currentTarget.checked || undefined }))
          }
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.groupScoring", "Group Scoring")}
          checked={Boolean(st.group_scoring)}
          onChange={(ev) =>
            onUpdate((ent) => setStEntryExt(ent, { group_scoring: ev.currentTarget.checked || undefined }))
          }
          disabled={disabled}
        />
        <NumberInput
          label={t("cardDetails.lorebook.trigger", "Trigger %")}
          value={typeof st.trigger_percent === "number" ? st.trigger_percent : 100}
          onChange={(value) =>
            onUpdate((ent) => setStEntryExt(ent, { trigger_percent: clampInt(value, { min: 0, max: 100, fallback: 100 }) }))
          }
          disabled={disabled}
          min={0}
          max={100}
        />
      </Group>

      <Group grow>
        <Checkbox
          label={t("cardDetails.lorebook.nonRecursable", "Non-recursable")}
          checked={Boolean(st.non_recursable)}
          onChange={(ev) => onUpdate((ent) => setStEntryExt(ent, { non_recursable: ev.currentTarget.checked || undefined }))}
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.preventFurtherRecursion", "Prevent further recursion")}
          checked={Boolean(st.prevent_further_recursion)}
          onChange={(ev) =>
            onUpdate((ent) =>
              setStEntryExt(ent, { prevent_further_recursion: ev.currentTarget.checked || undefined })
            )
          }
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.delayUntilRecursion", "Delay until recursion")}
          checked={Boolean(st.delay_until_recursion)}
          onChange={(ev) =>
            onUpdate((ent) =>
              setStEntryExt(ent, { delay_until_recursion: ev.currentTarget.checked || undefined })
            )
          }
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.ignoreBudget", "Ignore budget")}
          checked={Boolean(st.ignore_budget)}
          onChange={(ev) =>
            onUpdate((ent) => setStEntryExt(ent, { ignore_budget: ev.currentTarget.checked || undefined }))
          }
          disabled={disabled}
        />
        <NumberInput
          label={t("cardDetails.lorebook.recursionLevel", "Recursion Level")}
          value={typeof st.recursion_level === "number" ? st.recursion_level : 0}
          onChange={(value) =>
            onUpdate((ent) =>
              setStEntryExt(ent, { recursion_level: clampInt(value, { min: 0, max: 1000, fallback: 0 }) })
            )
          }
          disabled={disabled || !st.delay_until_recursion}
          min={0}
        />
      </Group>

      <DeferredCommaListInput
        label={t("cardDetails.lorebook.inclusionGroup", "Inclusion Group")}
        placeholder={t("cardDetails.lorebook.keysPlaceholder", "Comma separated list")}
        disabled={disabled}
        values={Array.isArray(st.inclusion_groups) ? st.inclusion_groups : []}
        onCommit={(list) =>
          onUpdate((ent) =>
            setStEntryExt(ent, { inclusion_groups: list.length > 0 ? list : undefined })
          )
        }
        resetKey={`${resetKeyBase}:groups:${(Array.isArray(st.inclusion_groups) ? st.inclusion_groups : []).join("|")}`}
      />

      <Group grow>
        <NumberInput
          label={t("cardDetails.lorebook.groupWeight", "Group Weight")}
          value={typeof st.group_weight === "number" ? st.group_weight : 100}
          onChange={(value) =>
            onUpdate((ent) => setStEntryExt(ent, { group_weight: clampInt(value, { min: 0, max: 100000, fallback: 100 }) }))
          }
          disabled={disabled}
          min={0}
        />
        <Checkbox
          label={t("cardDetails.lorebook.prioritizeInclusion", "Prioritize Inclusion")}
          checked={Boolean(st.prioritize_inclusion)}
          onChange={(ev) =>
            onUpdate((ent) => setStEntryExt(ent, { prioritize_inclusion: ev.currentTarget.checked || undefined }))
          }
          disabled={disabled}
        />
      </Group>

      <Group grow>
        <NumberInput
          label={t("cardDetails.lorebook.sticky", "Sticky")}
          value={typeof st.sticky === "number" ? st.sticky : 0}
          onChange={(value) =>
            onUpdate((ent) => setStEntryExt(ent, { sticky: clampInt(value, { min: 0, max: 100000, fallback: 0 }) }))
          }
          disabled={disabled}
          min={0}
        />
        <NumberInput
          label={t("cardDetails.lorebook.cooldown", "Cooldown")}
          value={typeof st.cooldown === "number" ? st.cooldown : 0}
          onChange={(value) =>
            onUpdate((ent) => setStEntryExt(ent, { cooldown: clampInt(value, { min: 0, max: 100000, fallback: 0 }) }))
          }
          disabled={disabled}
          min={0}
        />
        <NumberInput
          label={t("cardDetails.lorebook.delay", "Delay")}
          value={typeof st.delay === "number" ? st.delay : 0}
          onChange={(value) =>
            onUpdate((ent) => setStEntryExt(ent, { delay: clampInt(value, { min: 0, max: 100000, fallback: 0 }) }))
          }
          disabled={disabled}
          min={0}
        />
      </Group>

      <Textarea
        label={t("cardDetails.lorebook.automationId", "Automation ID")}
        value={typeof st.automation_id === "string" ? st.automation_id : ""}
        onChange={(ev) =>
          onUpdate((ent) => setStEntryExt(ent, { automation_id: ev.currentTarget.value.trim() || undefined }))
        }
        disabled={disabled}
        minRows={1}
        autosize
      />

      {/* Triggers / matching sources - keep simple checkboxes for common ones */}
      <Group grow>
        <Checkbox
          label={t("cardDetails.lorebook.triggerNormal", "Normal")}
          checked={triggers.includes("normal")}
          onChange={(ev) => {
            const next = new Set(triggers);
            if (ev.currentTarget.checked) next.add("normal");
            else next.delete("normal");
            onUpdate((ent) => setStEntryExt(ent, { triggers: Array.from(next) as any }));
          }}
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.triggerContinue", "Continue")}
          checked={triggers.includes("continue")}
          onChange={(ev) => {
            const next = new Set(triggers);
            if (ev.currentTarget.checked) next.add("continue");
            else next.delete("continue");
            onUpdate((ent) => setStEntryExt(ent, { triggers: Array.from(next) as any }));
          }}
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.triggerSwipe", "Swipe")}
          checked={triggers.includes("swipe")}
          onChange={(ev) => {
            const next = new Set(triggers);
            if (ev.currentTarget.checked) next.add("swipe");
            else next.delete("swipe");
            onUpdate((ent) => setStEntryExt(ent, { triggers: Array.from(next) as any }));
          }}
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.triggerQuiet", "Quiet")}
          checked={triggers.includes("quiet")}
          onChange={(ev) => {
            const next = new Set(triggers);
            if (ev.currentTarget.checked) next.add("quiet");
            else next.delete("quiet");
            onUpdate((ent) => setStEntryExt(ent, { triggers: Array.from(next) as any }));
          }}
          disabled={disabled}
        />
      </Group>

      <Group grow>
        <Checkbox
          label={t("cardDetails.lorebook.matchSourceCharDesc", "Character Description")}
          checked={additionalSources.includes("character_description")}
          onChange={(ev) => {
            const next = new Set(additionalSources);
            if (ev.currentTarget.checked) next.add("character_description");
            else next.delete("character_description");
            onUpdate((ent) => setStEntryExt(ent, { additional_matching_sources: Array.from(next) as any }));
          }}
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.matchSourceScenario", "Scenario")}
          checked={additionalSources.includes("scenario")}
          onChange={(ev) => {
            const next = new Set(additionalSources);
            if (ev.currentTarget.checked) next.add("scenario");
            else next.delete("scenario");
            onUpdate((ent) => setStEntryExt(ent, { additional_matching_sources: Array.from(next) as any }));
          }}
          disabled={disabled}
        />
        <Checkbox
          label={t("cardDetails.lorebook.matchSourceCreatorsNotes", "Creator's Notes")}
          checked={additionalSources.includes("creators_notes")}
          onChange={(ev) => {
            const next = new Set(additionalSources);
            if (ev.currentTarget.checked) next.add("creators_notes");
            else next.delete("creators_notes");
            onUpdate((ent) => setStEntryExt(ent, { additional_matching_sources: Array.from(next) as any }));
          }}
          disabled={disabled}
        />
      </Group>

      <Textarea
        label={t("cardDetails.lorebook.comment", "Comment")}
        value={entry.comment ?? ""}
        onChange={(ev) =>
          onUpdate((ent) => ({
            ...ent,
            comment: ev.currentTarget.value.trim() || undefined,
          }))
        }
        disabled={disabled}
        minRows={2}
        placeholder={t("cardDetails.lorebook.optional", "Optional")}
      />
    </Stack>
  );
}


