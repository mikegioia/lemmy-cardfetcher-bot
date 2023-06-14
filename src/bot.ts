import LemmyBot from 'lemmy-bot';
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
 * Processes a comment and replies if any cards are found.
 */
async function processContent(
  content: string,
  createComment: (comment: string) => void
) {
  const gathererCards = content.match(gathererRegex);

  if (!gathererCards) {
    return;
  }

  const cards = await getCards(gathererCards);

  if (cards) {
    createComment(getComment(cards));
  }
}

/**
 * Reads in a post or comment message and pulls out any
 * cards that are listed in the approved format. Each card
 * is queried and compiled into a single message replied
 * to the original post or comment.
 */
async function getCards(gathererCards: string[]): Promise<any[]> {
  const cards: string[] = [];

  for (const card of gathererCards) {
    const scryfallResponse = await searchCardName(card);
    const cardList = scryfallResponse.data;

    if (cardList) {
      cards.push(getCardCommentLine(pickBestCard(card, cardList)));
    } else {
      cards.push(`Unable to retrieve information for "${card}"`);
    }
  }

  return cards;
}

/**
 * Searches the Scryfall database for a match on the
 * card name and then returns a string containing links
 * to the card if found.
 */
async function searchCardName(cardName: string): Promise<any> {
  const encoded = encodeURI(cardName);
  const response = await fetch(scryfallEndpoint + encoded);
  const json = await response.json();

  return json;
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
 */
function getCardCommentLine(card: ScryfallCardObject): string {
  const utmSource = 'utm_source=lemmy';

  const responseLine =
    `[${card.name}](${card.image_uris.normal}&${utmSource}) - ` +
    `[(G)](${card.related_uris.gatherer}&${utmSource}) ` +
    `[(SF)](${card.scryfall_uri}) ` +
    `[(txt)](${card.uri}?${utmSource}&format=text)`;

  return responseLine;
}

/**
 * Returns the full markdown comment to reply with.
 */
function getComment(cards: string[]): string {
  return (
    cards.map((line) => '* ' + line).join('\n') +
    '\n\n---\n[[card name]] to call'
  );
}

/**
 * Looks for the best match for the card name in the set
 * of cards found in the scryfall search.
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
          comment: { id, post_id, content },
          creator: { name }
        },
        botActions: { createComment },
        preventReprocess
      }) => {
        if (name !== USERNAME_OR_EMAIL) {
          processContent(String(content), (comment) => {
            createComment({
              content: comment,
              postId: post_id,
              parentId: id
            });
          });
        }

        preventReprocess();
      }
    },
    post: {
      handle: ({
        postView: {
          post: { id, body },
          creator: { name }
        },
        botActions: { createComment },
        preventReprocess
      }) => {
        if (name !== USERNAME_OR_EMAIL) {
          processContent(String(body), (comment) => {
            createComment({
              content: comment,
              postId: id
            });
          });
        }

        preventReprocess();
      }
    }
  }
});

bot.start();
