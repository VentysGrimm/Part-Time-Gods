import { PTG_PREMADE_CHOICES } from "../module/data/premade-choices.mjs";
import { PTG_PREMADE_ITEMS } from "../module/data/premade-items.mjs";
import { auditCreatedItemDocuments, itemAuditHasIssues, itemAuditIssueLines } from "../module/data/premade-item-audit.mjs";

const audit = auditCreatedItemDocuments([
  { name: "character-creation", documents: PTG_PREMADE_CHOICES },
  { name: "premade-items", documents: PTG_PREMADE_ITEMS }
]);

console.log(JSON.stringify(audit, null, 2));

if (itemAuditHasIssues(audit)) {
  for (const line of itemAuditIssueLines(audit)) console.error(line);
  process.exit(1);
}
