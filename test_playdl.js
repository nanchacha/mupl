import play from 'play-dl';

async function run() {
  try {
    const stream = await play.stream('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log("Success! Format:", stream.type);
    process.exit(0);
  } catch (e) {
    console.error("play-dl Error:", e.message);
  }
}
run();
