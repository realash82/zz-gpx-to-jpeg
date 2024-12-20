import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import Webdriver from 'selenium-webdriver';
import Chrome from 'selenium-webdriver/chrome.js';
import express from 'express';
import HttpTerminator from 'http-terminator';
import getPort from 'get-port';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export default async (file: string): Promise<void> => {
  file = path.resolve(file);
  
  const tmpdir = path.resolve(os.tmpdir(), uuidv4());
  const tempfile = path.resolve(tmpdir, 'tmp.gpx');
  const port = await getPort();
  const url = `http://localhost:${port}/static/gpx.html`;
  const httpTerminator = HttpTerminator.createHttpTerminator({
    server: express()
      .use('/static', express.static(path.resolve('static')))
      .use('/tmp', express.static(tmpdir))
      .listen(port)
  });
  
  const options = new Chrome.Options();
  options.addArguments(
    '--headless=old',
    '--hide-scrollbars',
    '--disable-gpu',
    '--window-size=1920,1080',
    '--force-device-scale-factor=2',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-dev-shm-usage'
  );

  const driver = await new Webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    await fs.mkdir(tmpdir);
    await fs.copyFile(file, tempfile);
    await driver.get(url);
    await new Promise((resolve) => { setTimeout(resolve, 10000); });
    const screenshot = await driver.takeScreenshot();
    await sharp(Buffer.from(screenshot, 'base64')).jpeg({ mozjpeg: true, quality: 75 }).toFile(`${file}.jpg`);
  } finally {
    try { await fs.rm(tmpdir, { recursive: true, force: true }); } catch (e) {
      console.error(e);
    }
    await Promise.all([
      httpTerminator.terminate(),
      driver.quit()
    ]);
  }  
}
