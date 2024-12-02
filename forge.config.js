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
        setupLanguages: ['zh-CN', 'en-US', 'ja-JP'],
        language: '2052',
        title: {
          '2052': 'Guidewire 开发工具',
          '1033': 'Guidewire Dev Tools',
          '1041': 'Guidewire 開発ツール'
        },
        description: {
          '2052': 'Guidewire 开发工具套件',
          '1033': 'Development toolkit for Guidewire',
          '1041': 'Guidewire 開発ツールキット'
        },
        authors: 'Ifan Cao',
        owners: 'Capgemini',
        requiresAdministrator: false,
        removeDefaultProgram: true,
        deleteAppDataOnUninstall: false,
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
