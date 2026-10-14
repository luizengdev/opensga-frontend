import type {TestInfo} from "@playwright/test";
import * as allure from "allure-js-commons/sync";

type Severity = "blocker" | "critical" | "normal" | "minor" | "trivial";

export const annotate = (
  testInfo: TestInfo,
  labels: {
    epic: string;
    feature: string;
    severity?: Severity;
    tags?: string[];
  },
) => {
  const severity = labels.severity ?? "critical";
  const qaId = testInfo.title.match(/QA-[A-Z0-9-]+/)?.[0];
  const priority =
    testInfo.titlePath.join(" ").match(/@p([0-2])\b/)?.[0]?.replace("@", "") ?? "p0";
  const tags = [priority, ...(qaId ? [qaId] : []), ...(labels.tags ?? [])];

  allure.epic(labels.epic);
  allure.feature(labels.feature);
  allure.severity(severity);
  allure.tags(...tags);
};
