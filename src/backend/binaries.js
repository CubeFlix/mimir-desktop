const path = require('path');
const { app } = require('electron');
const { platform } = require('os');

function getPlatform() {
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux';
    case 'darwin':
    case 'sunos':
      return 'mac';
    case 'win32':
      return 'win';
  }
}

function getBinariesPath() {
  const IS_PROD = process.env.NODE_ENV === 'production';
  const { isPackaged } = app;
  const binariesPath =
    IS_PROD && isPackaged
      ? path.join(process.resourcesPath, `./${getPlatform()}`)
      : path.join(app.getAppPath(), 'resources', getPlatform());
  return binariesPath;
} 

const wkHtmlToPdf = path.join(getBinariesPath(), {'win': 'wkhtmltopdf.exe'}[getPlatform()]);
const wkHtmlToPdfVersion = '0.12.6';

module.exports = {
    getPlatform,
    getBinariesPath,
    wkHtmlToPdf,
    wkHtmlToPdfVersion
}