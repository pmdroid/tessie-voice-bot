import ffmpeg from 'fluent-ffmpeg';

// had to add this because openai doesn't support ogg :(
export const convertOggToWav = (inputPath: string, outputPath: string) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err: any) => {
        console.error('Error during conversion:', err);
        reject(err);
      })
      .save(outputPath);
  });
};
