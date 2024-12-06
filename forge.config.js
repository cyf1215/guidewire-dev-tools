const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon'
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
        setupExeDir: '.',
        noMsi: true,
        registryKeys: {
          "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GuidewireDevTools": {
            "DisplayName": "Guidewire Dev Tools",
            "DisplayIcon": "%INSTALLPATH%\\Guidewire Dev Tools.exe",
            "UninstallString": "%INSTALLPATH%\\Uninstall Guidewire Dev Tools.exe",
            "QuietUninstallString": "%INSTALLPATH%\\Uninstall Guidewire Dev Tools.exe --uninstall -s",
            "Publisher": "Ifan Cao",
            "DisplayVersion": "0.0.5"
          }
        },
        removeDefaultProgram: true,
        deleteAppDataOnUninstall: true,
        setupEvents: {
          postInstall: [
            {
              command: 'powershell',
              args: [
                '-NoProfile',
                '-ExecutionPolicy', 'Bypass',
                '-Command',
                'Get-ChildItem "$env:LOCALAPPDATA\\guidewire-dev-tools" -Directory -Filter "app-*" | Sort-Object CreationTime -Descending | Select-Object -Skip 1 | Remove-Item -Recurse -Force'
              ]
            }
          ]
        }
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
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
