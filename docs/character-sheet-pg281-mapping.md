# Character Sheet PDF Page 281 Mapping

This checklist maps the player character Actor sheet to the blank character sheet shown on PDF viewer page 281 of the PTG2E core rules. The live sheet keeps Foundry-only action buttons outside the printed-page layout while preserving the printed page order.

## Page 1 Fields

| PDF area | Live sheet control | Canonical data path |
| --- | --- | --- |
| Name | Header name input | `actor.name` |
| God/dess Of | Header concept input | `system.identity.concept` |
| Conditions | Notes textarea plus owned Condition Items | `system.conditions`; embedded `condition` Items |
| Initiative | Derived readout | `system.derived.initiative` |
| Strength | Derived readout | `system.derived.strength` |
| Movement | Derived readout | `system.derived.movement` |
| Work FT/W | Occupation free-time input | `system.resources.occupationFreeTime` |
| Spark | Spark input | `system.resources.spark` |
| Health | Box resource track | `system.resources.health.value`; `system.resources.health.max` |
| Psyche | Box resource track | `system.resources.psyche.value`; `system.resources.psyche.max` |
| Free Time | Box resource track plus workflow button | `system.resources.freeTime`; `system.resources.freeTimeMax` |
| Wealth | Box resource track plus workflow button | `system.resources.wealth`; `system.resources.wealthMax` |
| Legendary Acts | Notes textarea | `system.resources.legendaryActs` |
| Fragments | Box resource track | `system.resources.fragments.value`; `system.resources.fragments.max` |
| Failings | Notes textarea | `system.attachments.failings`; embedded `curse` / failing Items where present |
| Occupation | Identity input and choice application | `system.identity.occupation`; embedded `occupation` Item |
| Age & Ethnicity | Identity input | `system.identity.ageEthnicity` |
| Theology | Identity input and choice application | `system.identity.theology`; embedded `theology` Item |
| Archetype | Identity input and choice application | `system.identity.archetype`; embedded `archetype` Item |
| Dominion | Identity input and choice application | `system.identity.dominion`; embedded `domain` Item |
| Skills | Roll buttons plus score inputs | `system.skills.*` |
| Manifestations | Roll buttons plus score inputs | `system.manifestations.*` |
| XP Gained | XP input | `system.resources.xpGained` |
| XP Spent | Derived readout from purchase history | `system.resources.xpPurchases`; legacy `system.resources.xpSpent` |
| Specialties | Notes textarea | `system.specialties` |

## Page 2 Runtime Sections

The printed front page does not contain every Foundry runtime section, so the Actor sheet keeps these on Page 2 while preserving item-backed data ownership.

| Sheet section | Canonical data source |
| --- | --- |
| Blessings | Embedded `blessing` Items |
| Curses | Embedded `curse` Items |
| Bonds | Embedded `bond` Items |
| Worshippers | Embedded `worshipper` Items |
| Vassals | Embedded `vassal` Items |
| Relics | Embedded `relic` Items |
| Truths | Embedded `truth` Items |
| Gear and armor | Embedded `weapon`, `armor`, `gear`, and `gearQuality` Items |
| Notes | `system.notes` |

## Verification Notes

- The front-page resource order follows PDF page 281: Health, Psyche, Free Time, Wealth, Legendary Acts, Fragments.
- Health, Psyche, Free Time, and Wealth reserve ten visible boxes to match the printed sheet. Fragments reserves twenty visible boxes.
- Free Time and Wealth remain top-level scalar resources because existing Actor methods and downtime workflows use `system.resources.freeTime` and `system.resources.wealth`.
- Conditions, attachments, divine gifts, and gear remain embedded Item data rather than copied prose blocks on the Actor itself. Backers' Pregens ship only as metadata placeholders until permission for full stat/prose reproduction is confirmed.
