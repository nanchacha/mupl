import { Innertube } from 'youtubei.js';

async function run() {
  try {
    const yt = await Innertube.create();
    const info = await yt.getInfo('dQw4w9WgXcQ');
    console.log("Title:", info.basic_info.title);
    
    const stream = await yt.download('dQw4w9WgXcQ', {
      type: 'audio',
      quality: 'best',
      format: 'any'
    });
    console.log("Stream successfully obtained:", stream.byteLength !== undefined);
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
