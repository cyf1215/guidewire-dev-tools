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
        allowElevation: true,
        defaultInstallPath: "C:\\Program Files\\Guidewire Dev Tools",
        shortcutFolderName: "Guidewire Dev Tools",
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        registryKeys: {
          "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GuidewireDevTools": {
            "DisplayName": "Guidewire Dev Tools",
            "UninstallString": "C:\\Program Files\\Guidewire Dev Tools\\Uninstall Guidewire Dev Tools.exe",
            "DisplayIcon": "C:\\Program Files\\Guidewire Dev Tools\\Guidewire Dev Tools.exe",
            "Publisher": "Ifan Cao",
            "URLInfoAbout": "https://github.com/cyf1215/guidewire-dev-tools",
            "HelpLink": "https://github.com/cyf1215/guidewire-dev-tools/issues"
          }
        },
        noMsi: false,
        setupMsi: 'Guidewire Dev Tools.msi',
        remoteReleases: {
          repo: "cyf1215/guidewire-dev-tools",
          token: process.env.GITHUB_TOKEN
        },
        allowDowngrade: false,
        removeDefaultProgram: true,
        deleteAppDataOnUninstall: false
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
