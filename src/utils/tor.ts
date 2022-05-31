import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import { TorDownloader } from '@unnusualnorm/tor-downloader';
import hasbin from 'hasbin';

export async function installTor(): Promise<void> {
  // Spawn a Tor process
  const startTor = async (torBinaryPath: string): Promise<void> => {
    const torProcess = spawn(torBinaryPath);
    torProcess.on('close', () => startTor(torBinaryPath));

    torProcess.stderr.on('data', (chunk) =>
      console.error(String(chunk).trim())
    );
    torProcess.stdout.on('data', (chunk) => console.log(String(chunk).trim()));
  };

  // Check if we have Tor installed
  if (hasbin.sync('tor')) return startTor('tor');

  // We don't have Tor installed, so we need to download it
  // Unfortunately, the downloader doesn't currently support linux...
  if (
    process.platform != 'win32' &&
    process.env.IGNORE_TOR_DOWNLOADER_ARCH != 'true'
  )
    throw new Error(
      'Tor-downloader is not supported on this platform... (Set IGNORE_TOR_DOWNLOADER_ARCH=true to ignore)'
    );

  // Directory where Tor will be retrieved
  const torPath = join(tmpdir(), 'Tor');
  const torDownloader = new TorDownloader();

  // Retrieve the downloaded Tor path, make it executable
  await torDownloader.retrieve(torPath);
  await torDownloader.addExecutionRigthsOnTorBinaryFile(torPath);

  // Start the Tor process
  const torBinaryPath = join(torPath, torDownloader.getTorBinaryFilename());
  return startTor(torBinaryPath);
}
