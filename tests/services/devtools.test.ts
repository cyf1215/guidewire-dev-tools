import { DevToolsService } from '../../src/services/devtools';

describe('DevToolsService', () => {
  let service: DevToolsService;

  beforeEach(() => {
    service = DevToolsService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = DevToolsService.getInstance();
    const instance2 = DevToolsService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should track installation status', () => {
    expect(service.isInstalled()).toBe(false);
  });

  // 更多测试用例...
}); 