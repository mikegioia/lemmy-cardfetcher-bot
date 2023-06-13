import LemmyBot, { CommentView, PostView } from 'lemmy-bot';
import { config } from 'dotenv';
import { ScryfallCardObject } from "./scryfall";

config();

const { INSTANCE, USERNAME_OR_EMAIL, PASSWORD, SCRYFALL_API_KEY } =
  process.env as Record<string, string>;

const scryfallEndpoint = "https://api.scryfall.com/cards/search?q=";
const gathererRegex = new RegExp(/(?<=\[\[)(.*?)(?=\]\])/g);

/**
 * Reads in a post or comment message and pulls out any
 * cards that are listed in the approved format. Each card
 * is queried and compiled into a single message replied
 * to the original post or comment.
 *
 * @param {string} message
 */
function searchCards (message: string): void {
  const gathererCards = message.match(gathererRegex);

  if (gathererCards) {
    gathererCards.forEach((card: string) => {
      fetchAndReturn(card)
    });
  }
}

/**
 * Searches the Scryfall database for a match on the card name
 * and then returns a link to the card if found.
 *
 * @param {string} card
 */
function fetchAndReturn (card: string): void {
  const encoded = encodeURI(card);

  console.log('fetching', card);

  fetch(scryfallEndpoint+encoded)
    .then((response: any) => response.json())
    .then((scryfallResponse: any) => {
      const cardList = scryfallResponse.data;

      console.log('response', cardList);

      if (cardList === null) {
        console.log(`Unable to retrieve information for "${card}"`)
      } else {
        //sendGathererInfo(pickBest(card, cardList));
        console.log('sendGathererInfo');
      }
    });
}

const bot = new LemmyBot({
  instance: INSTANCE,
  credentials: {
    username: USERNAME_OR_EMAIL,
    password: PASSWORD,
  },
  connection: {
    secondsBetweenPolls: 30,
  },
  federation: {
    allowList: [
      {
        instance: INSTANCE,
        communities: ['sandbox']
      },
    ],
  },
  dbFile: 'db.sqlite3',
  handlers: {
    async mention({
      mentionView: { comment },
      botActions: { createComment, getParentOfComment },
    }) {
      const results = true; //searchCards(comment.content);
      console.log(results);

      if (!results) {
        /*createComment({
          postId: comment.post_id,
          parentId: comment.id,
          content: 'No card was found',
        });*/
      } else {
        const { type, data } = await getParentOfComment(comment);

        if (type === 'post') {
          /* handle the direct reply to the post with the cards */
          /*const { post } = data as PostView;
          const { text } = await translator.translateText(
            `# ${post.name}${
              post.body
                ? `\n\n${
                    shouldSpoiler(post.body) ? spoilerify(post.body) : post.body
                  }`
                : ''
            }`,
            null,
            languageCode
          );

          createComment({
            content: `${text}\n\n*${signoffMap.get(languageCode)}*`,
            postId: comment.post_id,
            parentId: comment.id,
          });
          */
        } else {
          const {
            comment: { content: parentContent },
          } = data as CommentView;

          const text = 'Results of the search';
          console.log('we\'re posting a comment');
          /*createComment({
            content: `${results}\n`,
            postId: comment.post_id,
            parentId: comment.id,
          });*/
        }
      }
    },
  },
});

bot.start();