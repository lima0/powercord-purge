const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { getMessages } = getModule([ 'getMessages' ], false);
const { getChannelId } = getModule([ 'getLastSelectedChannelId' ], false);
const { getCurrentUser } = getModule([ 'getCurrentUser' ], false);

module.exports = class purge extends Plugin {
  startPlugin () {
    powercord.api.commands.registerCommand({
      command: 'purge',
      description: 'Deletes your messages',
      usage: '{c} number',
      executor: this.handleCommand.bind(this)
    });
  }

  pluginWillUnload () {
    powercord.api.commands.unregisterCommand('purge');
  }

  async handleCommand (args) {
    // command checking and stuff
    if (args.length < 1) {
      return {
        send: false,
        result:
          'usage: {c} amount startFrom: messageid'
      };
    }

    const messagesToDelete = Number(args[0]) + 1;

    if (isNaN(messagesToDelete)) {
      return {
        send: false,
        result:
          'it gotta be a number lol'
      };
    }


    const channelid = getChannelId();
    const messages = getMessages(channelid)._array;


    // check if messages exist
    if (messages.length === 0) {
      return {
        send: false,
        result:
          'you don\'t have any messages lmao'
      };
    }

    // eslint-disable-next-line prefer-const
    let messageArray = await getMessages(channelid)._array.filter(m => m.author.id === getCurrentUser().id);
    // reverse order of messages because discord gives them oldest first
    await messageArray.reverse();

    // for debugging purposes: const message = getMessage(channelid, messageid);

    // get messageID to start with
    if (args[1]) {
      if (args[1].length !== 18) {
        return {
          send: false,
          result: 'incorrect messageID'
        };
      }
      const startMessage = messageArray.find(m => m.id === args[1]);

      if (!startMessage) {
        return {
          send: false,
          result: 'Incorrect messageID'
        };
      }
      const startMessageIndex = messageArray.findIndex(m => m === startMessage);

      console.log(startMessageIndex);
      messageArray.slice(startMessageIndex + 1);
    }

    if (messagesToDelete > messageArray.length + 1 || messagesToDelete <= 0) {
      return {
        send: false,
        result:
          `input number between 1 and ${messageArray.length}`
      };
    }
    function yeet () {
      // i went for as low as 350ms, it worked, added an extra 30 because i feel like 350 is too low lol
      return new Promise((res) => {
        setTimeout(async () => {
          await require('powercord/webpack').messages.deleteMessage(channelid, messageArray[0].id);
          await messageArray.shift();
          res();
        }, 380);
      });
    }

    for (let i = 0; i < messagesToDelete - 1; i++) {
      await yeet();
    }

    return {
      send: false,
      result: `deleted ${messagesToDelete - 1} messages`
    };
  }
};
