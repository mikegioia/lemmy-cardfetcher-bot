/**
 * This interface serves as the structure for the
 * card information returned from the Scryfall API.
 */
export interface ScryfallCardObject {
  object: string;
  id: string;
  oracle_id: string;
  multiverse_ids: number[];
  mtgo_id: number;
  arena_id: number;
  mtgo_foil_id: number;
  tcgplayer_id: number;
  cardmarket_id: number;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
  image_uris: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text: string;
  power: string;
  toughness: string;
  colors: string[];
  color_identity: string[];
  keywords: string[];
  legalities: {
    standard: string;
    future: string;
    historic: string;
    gladiator: string;
    pioneer: string;
    explorer: string;
    modern: string;
    legacy: string;
    pauper: string;
    vintage: string;
    penny: string;
    commander: string;
    oathbreaker: string;
    brawl: string;
    historicbrawl: string;
    alchemy: string;
    paupercommander: string;
    duel: string;
    oldschool: string;
    premodern: string;
    predh: string;
  };
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: string;
  watermark: string;
  flavor_text: string;
  card_back_id: string;
  artist: string;
  artist_ids: string[];
  illustration_id: string;
  border_color: string;
  frame: string;
  security_stamp: string;
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  edhrec_rank: number;
  penny_rank: number;
  prices: {
    usd: string;
    usd_foil: string;
    usd_etched: string;
    eur: string;
    eur_foil: string;
    tix: string;
  };
  related_uris: {
    gatherer: string;
    tcgplayer_infinite_articles: string;
    tcgplayer_infinite_decks: string;
    edhrec: string;
  };
  purchase_uris: {
    tcgplayer: string;
    cardmarket: string;
    cardhoarder: string;
  };
}
