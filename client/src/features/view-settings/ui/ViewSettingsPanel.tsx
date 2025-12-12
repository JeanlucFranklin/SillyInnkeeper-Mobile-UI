import {
  Group,
  SegmentedControl,
  Switch,
  Text,
  Badge,
} from "@mantine/core";
import { useUnit } from "effector-react";
import {
  $columnsCount,
  $isCensored,
  setColumnsCount,
  toggleCensorship,
} from "../model";
import { $cards } from "@/entities/cards";

export function ViewSettingsPanel() {
  const [columnsCount, isCensored, setColumns, toggleCensor, cards] = useUnit([
    $columnsCount,
    $isCensored,
    setColumnsCount,
    toggleCensorship,
    $cards,
  ]);

  return (
    <Group gap="md" align="center" wrap="nowrap">
      <Group gap="xs" wrap="nowrap">
        <Text size="sm" fw={500}>
          Колонки
        </Text>
        <SegmentedControl
          size="xs"
          value={columnsCount.toString()}
          onChange={(value) => setColumns(Number(value) as 3 | 5 | 7)}
          data={[
            { label: "3", value: "3" },
            { label: "5", value: "5" },
            { label: "7", value: "7" },
          ]}
        />
      </Group>

      <Badge variant="light" color="gray" size="sm" style={{ flexShrink: 0 }}>
        {cards.length} карточек
      </Badge>

      <Switch
        size="sm"
        checked={isCensored}
        onChange={() => toggleCensor()}
        label={isCensored ? "Цензура: вкл" : "Цензура: выкл"}
        styles={{ label: { whiteSpace: "nowrap" } }}
      />
    </Group>
  );
}
