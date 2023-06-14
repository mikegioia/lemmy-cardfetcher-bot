import LemmyBot, { CommentView, PostView } from 'lemmy-bot';
import { config } from 'dotenv';
import { ScryfallCardObject } from './scryfall';
import distance = require('jaro-winkler');

config();

const { INSTANCE, USERNAME_OR_EMAIL, PASSWORD } = process.env as Record<
  string,
  string
>;

const gathererRegex = new RegExp(/(?<=\[\[)(.*?)(?=\]\])/g);
const scryfallEndpoint = 'https://api.scryfall.com/cards/search?q=';

/**
 * Reads in a post or comment message and pulls out any
 * cards that are listed in the approved format. Each card
 * is queried and compiled into a single message replied
 * to the original post or comment.
 *
 * @param {string} message
 */
function searchCards(message: string): void {
  const gathererCards = message.match(gathererRegex);
  const cards: string[] = [];

  if (!gathererCards) {
    return;
  }

  gathererCards.forEach((card: string) => {
    fetchAndGetResponseLine(card);
  });

  console.log(cards);
}

/**
 * Searches the Scryfall database for a match on the
 * card name and then returns a string containing links
 * to the card if found.
 *
 * @param {string} card
 */
function fetchAndGetResponseLine(card: string): void {
  const encoded = encodeURI(card);

  fetch(scryfallEndpoint + encoded)
    .then((response: any) => response.json())
    .then((scryfallResponse: any) => {
      const cardList = scryfallResponse.data;

      if (!cardList) {
        console.log(`Unable to retrieve information for "${card}"`);
      }

      getResponseLine(pickBestCard(card, cardList));
    });
}

/**
 * Looks for the best match for the card name in the set
 * of cards found in the scryfall search.
 *
 * @param {string}               cardName
 * @param {ScryfallCardObject[]} cardList
 */
function pickBestCard(
  cardName: string,
  cardList: ScryfallCardObject[]
): ScryfallCardObject {
  let index = 0;
  let max = Number.NEGATIVE_INFINITY;

  cardList.forEach((card, i) => {
    const num = distance(card.name.toLowerCase(), cardName.toLowerCase());

    if (num > max) {
      max = num;
      index = i;
    }
  });

  return cardList[index];
}

/**
 * Returns a single line in the comment reply text
 * containing all of the different links to the card:
 *
 *   `Card Name - (G) (SF) (txt)`
 *
 * Card Name: Scryfall image link
 *       (G): Gatherer web link
 *      (SF): Scryfall web link
 *     (txt): Scryfall text link
 *
 * @param {ScryfallCardObject} card
 */
function getResponseLine(card: ScryfallCardObject): void {
  const utmSource = 'utm_source=lemmy';

  const responseLine =
    `[${card.name}](${card.image_uris.normal}&${utmSource}) - ` +
    `[(G)](${card.related_uris.gatherer}&${utmSource}) ` +
    `[(SF)](${card.scryfall_uri}) ` +
    `[(txt)](${card.uri}?${utmSource}&format=text)`;

  console.log(responseLine + '\n');
}

const bot = new LemmyBot({
  instance: INSTANCE,
  credentials: {
    username: USERNAME_OR_EMAIL,
    password: PASSWORD
  },
  connection: {
    secondsBetweenPolls: 30
  },
  federation: {
    allowList: [
      {
        instance: INSTANCE,
        communities: ['sandbox']
      }
    ]
  },
  dbFile: 'db.sqlite3',
  handlers: {
    comment: {
      handle: ({
        commentView: {
          comment: { creator_id, id, content }
        },
        botActions: { createComment }
      }) => {
        console.log(id + ': ' + content);
      }
    },
    post: {
      handle: ({
        postView: {
          post: { creator_id, id, body }
        },
        botActions: { createComment }
      }) => {
        console.log('post: [' + id + ']');
      }
    }
  }
});

// bot.start();
searchCards(
  "My favorite cards are [[Verdant Force]] and [[Stitcher's Supplier]], what are yours?"
);
