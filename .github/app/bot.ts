import { Probot } from 'probot';

function bot(app: Probot): void {
  app.onAny((event) => {
    console.log('Event received:', JSON.stringify(event, null, 2));
  });
}

export default bot;
