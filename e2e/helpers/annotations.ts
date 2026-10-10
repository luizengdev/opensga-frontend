import type {TestInfo} from "@playwright/test";

export const annotate = (
  testInfo: TestInfo,
  labels: {epic: string; feature: string; severity?: string},
) => {
  testInfo.annotations.push(
    {type: "epic", description: labels.epic},
    {type: "feature", description: labels.feature},
    {type: "severity", description: labels.severity ?? "critical"},
  );
};
