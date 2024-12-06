import { MenuItemConstructorOptions, app } from 'electron';
import { checkForUpdates } from './updater';

const template: MenuItemConstructorOptions[] = [
  {
    label: '帮助',
    submenu: [
      {
        label: `当前版本：v${app.getVersion()}`,
        enabled: false
      },
      { type: 'separator' },
      {
        label: '检查更新',
        click: () => checkForUpdates()
      }
    ]
  }
];

export { template }; 