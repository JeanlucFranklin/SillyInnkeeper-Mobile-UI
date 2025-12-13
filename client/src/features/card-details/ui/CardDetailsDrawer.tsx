import { useMemo, useState } from "react";
import { useUnit } from "effector-react";
import {
  Accordion,
  Badge,
  Button,
  Code,
  CopyButton,
  Divider,
  Drawer,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Skeleton,
  Spoiler,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
  Image,
  Modal,
} from "@mantine/core";
import type { CardDetails } from "@/shared/types/cards";
import { $details, $error, $isLoading, $openedId, closeCard } from "../model";
import { $isCensored } from "@/features/view-settings";
import { CreatorNotesRenderer } from "./CreatorNotesRenderer";

function formatDateRu(ms: number | null | undefined): string {
  const t = typeof ms === "number" ? ms : Number(ms);
  if (!Number.isFinite(t) || t <= 0) return "—";
  return new Date(t).toLocaleString("ru-RU");
}

function CollapsibleFieldBlock({
  label,
  value,
  maxHeight = 160,
  dimmedEmptyText = "—",
}: {
  label: string;
  value: string | null | undefined;
  maxHeight?: number;
  dimmedEmptyText?: string;
}) {
  const has = Boolean(value && value.trim().length > 0);
  return (
    <Paper p="md" style={{ minHeight: 110 }}>
      <Text size="sm" fw={600} mb={6}>
        {label}
      </Text>
      {has ? (
        <Spoiler maxHeight={maxHeight} showLabel="Показать" hideLabel="Скрыть">
          <Text style={{ whiteSpace: "pre-wrap" }}>{value}</Text>
        </Spoiler>
      ) : (
        <Text c="dimmed">{dimmedEmptyText}</Text>
      )}
    </Paper>
  );
}

function JsonBlock({ value }: { value: unknown | null }) {
  const pretty = useMemo(() => {
    if (value == null) return "";
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  return (
    <Paper p="md">
      <Group justify="space-between" align="center" mb={8}>
        <Text size="sm" fw={600}>
          Raw JSON
        </Text>
        <CopyButton value={pretty}>
          {({ copied, copy }) => (
            <Button variant="light" size="xs" onClick={copy}>
              {copied ? "Скопировано" : "Копировать"}
            </Button>
          )}
        </CopyButton>
      </Group>
      <ScrollArea h={520} type="auto">
        <Code block>{pretty || "—"}</Code>
      </ScrollArea>
    </Paper>
  );
}

function GreetingsAccordion({
  title,
  greetings,
}: {
  title: string;
  greetings: string[];
}) {
  if (!greetings || greetings.length === 0) {
    return (
      <Paper p="md">
        <Text size="sm" fw={600} mb={6}>
          {title}
        </Text>
        <Text c="dimmed">—</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md">
      <Group justify="space-between" align="center" mb={8}>
        <Text size="sm" fw={600}>
          {title}
        </Text>
        <Badge variant="light" color="gray">
          {greetings.length}
        </Badge>
      </Group>

      <Accordion variant="contained" radius="md">
        {greetings.map((g, idx) => {
          const preview = (g || "").split("\n")[0]?.trim() || "—";
          return (
            <Accordion.Item key={idx} value={String(idx)}>
              <Accordion.Control>
                <Group justify="space-between" wrap="nowrap">
                  <Text lineClamp={1}>
                    {idx + 1}. {preview}
                  </Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Group justify="flex-end" mb={8}>
                  <CopyButton value={g || ""}>
                    {({ copied, copy }) => (
                      <Button variant="light" size="xs" onClick={copy}>
                        {copied ? "Скопировано" : "Копировать"}
                      </Button>
                    )}
                  </CopyButton>
                </Group>
                <Spoiler maxHeight={220} showLabel="Показать" hideLabel="Скрыть">
                  <Text style={{ whiteSpace: "pre-wrap" }}>{g || "—"}</Text>
                </Spoiler>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Paper>
  );
}

function ActionsPanel({ details }: { details: CardDetails | null }) {
  return (
    <Paper
      p="md"
      style={{
        position: "sticky",
        top: 60,
        marginTop: 52,
      }}
    >
      <Stack gap="sm">
        <Text fw={600}>Действия</Text>

        <Tooltip label="Скоро" withArrow>
          <Button fullWidth variant="light" disabled>
            Скачать
          </Button>
        </Tooltip>
        <Tooltip label="Скоро" withArrow>
          <Button fullWidth variant="light" color="red" disabled>
            Удалить
          </Button>
        </Tooltip>
        <Tooltip label="Скоро" withArrow>
          <Button fullWidth variant="light" disabled>
            Переименовать
          </Button>
        </Tooltip>

        <Divider my="sm" />

        <Text fw={600}>Метаданные</Text>

        <Stack gap={6}>
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              ID
            </Text>
            <Group gap={6} wrap="nowrap">
              <Text size="sm" lineClamp={1} style={{ maxWidth: 140 }}>
                {details?.id ?? "—"}
              </Text>
              {details?.id && (
                <CopyButton value={details.id}>
                  {({ copied, copy }) => (
                    <Button variant="subtle" size="xs" onClick={copy}>
                      {copied ? "OK" : "Copy"}
                    </Button>
                  )}
                </CopyButton>
              )}
            </Group>
          </Group>

          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              Spec
            </Text>
            <Text size="sm">{details?.spec_version ?? "—"}</Text>
          </Group>

          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              Создано
            </Text>
            <Text size="sm">{formatDateRu(details?.created_at)}</Text>
          </Group>

          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              Токены (≈)
            </Text>
            <Text size="sm">
              {details ? String(details.prompt_tokens_est ?? 0) : "—"}
            </Text>
          </Group>

          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              Alt greetings
            </Text>
            <Text size="sm">
              {details ? String(details.alternate_greetings_count ?? 0) : "—"}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}

export function CardDetailsDrawer() {
  const [openedId, details, isLoading, error, isCensored] = useUnit([
    $openedId,
    $details,
    $isLoading,
    $error,
    $isCensored,
  ]);

  const opened = Boolean(openedId);
  const [imgOpened, setImgOpened] = useState(false);

  const tags = details?.tags ?? [];
  const imageSrc = openedId ? `/api/image/${openedId}` : undefined;

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => closeCard()}
        position="right"
        size="100%"
        title={
          <Title order={4} lineClamp={1}>
            {details?.name || "Карточка"}
          </Title>
        }
      >
        <Grid gutter="md">
          {/* Left pane */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap="md">
              {isLoading && (
                <Paper p="md">
                  <Group gap="md" wrap="nowrap">
                    <Skeleton h={220} w={160} radius="md" />
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Skeleton h={18} w="40%" />
                      <Skeleton h={14} w="75%" />
                      <Skeleton h={14} w="65%" />
                    </Stack>
                  </Group>
                </Paper>
              )}

              {error && (
                <Paper p="md">
                  <Text c="red" fw={600}>
                    Ошибка загрузки
                  </Text>
                  <Text c="dimmed">{error}</Text>
                </Paper>
              )}

              <Tabs defaultValue="main" keepMounted={false}>
                <Tabs.List>
                  <Tabs.Tab value="main">Основное</Tabs.Tab>
                  <Tabs.Tab value="alt">Alt greetings</Tabs.Tab>
                  <Tabs.Tab value="system">System</Tabs.Tab>
                  <Tabs.Tab value="raw">Raw</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="main" pt="md">
                  <Stack gap="md">
                    {/* Header block: image left (~35%), meta right */}
                    <Paper p="md">
                      <Grid gutter="md" align="stretch">
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <Group justify="space-between" align="center" mb={8}>
                            <Text fw={600}>Изображение</Text>
                            <Button
                              variant="light"
                              size="xs"
                              onClick={() => setImgOpened(true)}
                              disabled={!openedId}
                            >
                              Увеличить
                            </Button>
                          </Group>
                          <Image
                            src={imageSrc}
                            alt={details?.name || "Изображение карточки"}
                            fit="contain"
                            fallbackSrc="/favicon.svg"
                            style={{
                              maxHeight: 380,
                              filter: isCensored ? "blur(12px)" : "none",
                              cursor: openedId ? "zoom-in" : "default",
                            }}
                            onClick={() => {
                              if (!openedId) return;
                              setImgOpened(true);
                            }}
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 8 }}>
                          <Stack gap="sm">
                            <div>
                              <Text size="sm" fw={600} mb={4}>
                                Name
                              </Text>
                              <Title order={3} lh={1.15}>
                                {details?.name || "—"}
                              </Title>
                            </div>

                            <div>
                              <Text size="sm" fw={600} mb={6}>
                                Tags
                              </Text>
                              {tags.length > 0 ? (
                                <Group gap={6} wrap="wrap">
                                  {tags.map((t) => (
                                    <Badge key={t} variant="light" color="indigo">
                                      {t}
                                    </Badge>
                                  ))}
                                </Group>
                              ) : (
                                <Text c="dimmed">—</Text>
                              )}
                            </div>

                            <div>
                              <Text size="sm" fw={600} mb={6}>
                                Creator
                              </Text>
                              <Text>{details?.creator || "—"}</Text>
                            </div>

                            <div>
                              <CreatorNotesRenderer
                                value={details?.creator_notes}
                                defaultMaxHeight={140}
                              />
                            </div>
                          </Stack>
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <CollapsibleFieldBlock
                      label="Description"
                      value={details?.description}
                      maxHeight={180}
                    />
                    <CollapsibleFieldBlock
                      label="Personality"
                      value={details?.personality}
                      maxHeight={160}
                    />
                    <CollapsibleFieldBlock
                      label="Scenario"
                      value={details?.scenario}
                      maxHeight={160}
                    />
                    <CollapsibleFieldBlock
                      label="First message"
                      value={details?.first_mes}
                      maxHeight={220}
                    />
                    <CollapsibleFieldBlock
                      label="Message example"
                      value={details?.mes_example}
                      maxHeight={220}
                    />
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="alt" pt="md">
                  <Stack gap="md">
                    <GreetingsAccordion
                      title="Alternate greetings"
                      greetings={details?.alternate_greetings ?? []}
                    />
                    {details?.group_only_greetings &&
                      details.group_only_greetings.length > 0 && (
                        <GreetingsAccordion
                          title="Group only greetings"
                          greetings={details.group_only_greetings}
                        />
                      )}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="system" pt="md">
                  <Stack gap="md">
                    <CollapsibleFieldBlock
                      label="System prompt"
                      value={details?.system_prompt}
                      maxHeight={220}
                    />
                    <CollapsibleFieldBlock
                      label="Post history instructions"
                      value={details?.post_history_instructions}
                      maxHeight={220}
                    />
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="raw" pt="md">
                  <JsonBlock value={details?.data_json ?? null} />
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Grid.Col>

          {/* Right pane */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <ActionsPanel details={details} />
          </Grid.Col>
        </Grid>
      </Drawer>

      <Modal
        opened={imgOpened}
        onClose={() => setImgOpened(false)}
        size="xl"
        title={details?.name || "Изображение карточки"}
      >
        <Image
          src={imageSrc}
          alt={details?.name || "Изображение карточки"}
          fit="contain"
          fallbackSrc="/favicon.svg"
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            filter: isCensored ? "blur(12px)" : "none",
          }}
        />
      </Modal>
    </>
  );
}


