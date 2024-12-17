const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const pkg = require('./package.json');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
    ignore: [],
    overwrite: true,
    prune: true,
    derefSymlinks: true,
    win32metadata: {
      CompanyName: 'Capgemini',
      FileDescription: pkg.description,
      OriginalFilename: pkg.productName,
      ProductName: pkg.productName,
      InternalName: pkg.name
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: './assets/icon.ico',
        iconUrl: 'https://raw.githubusercontent.com/cyf1215/guidewire-dev-tools/main/assets/icon.ico',
        loadingGif: './assets/installing.gif',
        setupExe: 'Guidewire Dev Tools Setup.exe',
        registryKeys: {
          "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GuidewireDevTools": {
            "DisplayName": "Guidewire Dev Tools",
            "DisplayIcon": "%INSTALLPATH%\\Guidewire Dev Tools.exe",
            "UninstallString": "%INSTALLPATH%\\Uninstall Guidewire Dev Tools.exe",
            "QuietUninstallString": "%INSTALLPATH%\\Uninstall Guidewire Dev Tools.exe --uninstall -s",
            "Publisher": "Ifan Cao",
            "DisplayVersion": pkg.version
          }
        }
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'cyf1215',
          name: 'guidewire-dev-tools'
        },
        authToken: process.env.GITHUB_TOKEN,
        prerelease: false,
        draft: false,
        tagPrefix: 'v',
        releaseType: 'release'
      }
    }
  ]
};
