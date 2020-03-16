import { RollPayload } from "dice-roll/lib/models/roll-payload";
import axios from "axios"
import { DICE_SERVICE } from "../bot";
import { Message } from "discord.js";
import { RollResponse, Step } from "dice-roll/lib/models/roll-response";

const validateRegex = new RegExp([
  /^ *[1-9][0-9]*d[1-9][0-9]* */,                               // Required first roll
  /([+-] *[1-9][0-9]* *)?/,                                     // Optional +- modifier on required first roll
  /((\+ *[1-9][0-9]*d[1-9][0-9]* *) *([+-] *[1-9][0-9]* *)?)*$/ // Optional rolls with single +- modifier
].map(r => r.source).join(''));
const diceRegex = /[1-9][0-9]*d[1-9][0-9]*/;
const delimRegex = /[+-]/g;

const run = (input: string, message: Message) => {

  if (input.match(validateRegex)) {
    input = input.replace(/\s+/g, '');
    const rollPayload: RollPayload = {
      dice: [],
      count: 1,
    };
    const tokens = input.split(delimRegex);
    const delims = [...input.matchAll(delimRegex)];

    for(let i = 0; i < tokens.length; i++) {
      const token: string = tokens[i];

      if (token.match(diceRegex)) {
        const diceToken = token.split(/d/);
        rollPayload.dice.push({
          count: Number(diceToken[0]),
          sides: Number(diceToken[1]),
        });
      } else {
        rollPayload.dice[i-1].modifier = Number(`${delims[i-1]}${token}`)
      }
    }

    axios.post(`${DICE_SERVICE}`, rollPayload).then((response) => {
      const rollResponse: RollResponse = response.data;
      const step: Step = rollResponse.step[0];
      const resultParts = [];

      for (let rolls of step.rolls) {
        let resultPart =  `(${rolls.rolls.join(') + (')})`;
        if (rolls.modifier) {
          resultPart += rolls.modifier > 0 ? ` + ${rolls.modifier}` : ` - ${Math.abs(rolls.modifier)}`;
        }
        resultParts.push(resultPart);
      }
      message.channel.send(`${resultParts.join(' + ')} = ${step.total}`).then();
    }).catch(() => {
      message.channel.send('That roll is messed up...').then();
    });
  } else {
    message.channel.send('Sorry bud, I don\'t know how to roll that...').then();
  }
};

export { run }