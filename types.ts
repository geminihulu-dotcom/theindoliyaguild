export interface Sibling {
  id: number;
  name: string;
  alias?: string;
}

export enum CharacterClass {
  MONARCH = 'MONARCH',
  ASSASSIN = 'ASSASSIN',
  MAGE = 'MAGE',
  HEALER = 'HEALER',
  TANK = 'TANK',
  RANGER = 'RANGER',
  FIGHTER = 'FIGHTER',
  SUMMONER = 'SUMMONER',
}

export enum Rank {
  S_RANK = 'S-Rank',
  A_RANK = 'A-Rank',
  B_RANK = 'B-Rank',
  C_RANK = 'C-Rank',
}

export interface GeneratedInfo {
  name: string;
  title: string;
  description: string;
  class: CharacterClass;
  rank: Rank;
  quote: string;
}

export type GeneratedCharacter = Sibling & Partial<GeneratedInfo> & {
  imageUrl?: string;
};