const line = require('@line/bot-sdk')
const {Lineconfig} = require('../configs/lineConfig.js')

const client = new line.Client(Lineconfig)

function handleEvent(event) {
    if (event.type === 'message' && event.message.type === 'text') {
      const message = {
        type: 'text',
        text: 'You clicked the button!',
      };
  
      client.replyMessage(event.replyToken, message)
        .then(() => {
          console.log('Message sent successfully');
        })
        .catch((err) => {
          console.error('Error sending message:', err);
        });
    }
}

exports.messager = (req, res) => {
    Promise.all(req.body.events.map(handleEvent))
      .then(() => res.json({ success: true }))
      .catch((err) => {
        console.error(err);
        res.status(500).end('Internal Server Error');
      });
}