/**
 * KNOWLEDGE ARCHIVE TYPES
 */

export type StationKey =
  | "01_hoang_cam_kitchen"
  | "02_field_hospital"
  | "03_command_bunker"
  | "04_ventilation_termite"
  | "05_booby_traps";

export type KnowledgeSectionKey =
  | "kitchen"
  | "hospital"
  | "command"
  | "ventilation"
  | "traps"
  | "overview"
  | "sacred";

export interface StationKnowledgeItem {
  id: StationKey;
  sectionKey: KnowledgeSectionKey;
  order: number;
  vi: string;
  en: string;
  sourceAuthority: string;
}
