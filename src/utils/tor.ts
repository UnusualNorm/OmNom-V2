import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import { TorDownloader } from '@unnusualnorm/tor-downloader';

export async function installTor(): Promise<void> {
  // Directory where Tor will be retrieved
  const torPath = join(tmpdir(), 'Tor');
  const torDownloader = new TorDownloader();

  // Retrieve Tor to torPath
  await torDownloader.retrieve(torPath);

  // Add execution rights to the Tor binary file
  await torDownloader.addExecutionRigthsOnTorBinaryFile(torPath);
  const torBinaryPath = join(torPath, torDownloader.getTorBinaryFilename());

  // Spawn a Tor process
  await new Promise((resolve, reject) => {
    const torProcess = spawn(torBinaryPath);
    torProcess.on('error', reject);
    torProcess.on('close', resolve);

    torProcess.stderr.on('data', (chunk) =>
      console.error(String(chunk).trim())
    );
    torProcess.stdout.on('data', (chunk) => console.log(String(chunk).trim()));
  });
}
