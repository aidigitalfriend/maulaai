/**
 * SANDBOX LOADER - Secure isolated execution environment for plugins
 * Uses isolated-vm for V8 isolation and vm2 as fallback
 */

import crypto from 'crypto';

// Try to import isolated-vm, fallback to vm2
let ivm = null;
let VM2 = null;

try {
  ivm = await import('isolated-vm');
  ivm = ivm.default || ivm;
} catch (e) {
  console.warn('isolated-vm not available, trying vm2...');
  try {
    const vm2Module = await import('vm2');
    VM2 = vm2Module.VM;
  } catch (e2) {
    console.warn('vm2 not available, using basic sandbox');
  }
}

// Sandbox configuration
const SANDBOX_LIMITS = {
  timeout: 5000,           // 5 second execution timeout
  memoryLimit: 128,        // 128MB memory limit
  maxOutputSize: 1024 * 100, // 100KB max output
  maxAsyncDepth: 10,       // Max async call depth
};

// Blocked APIs in sandbox
const BLOCKED_GLOBALS = [
  'process', 'require', 'module', 'exports', '__dirname', '__filename',
  'Buffer', 'setImmediate', 'clearImmediate', 'global', 'globalThis',
  'eval', 'Function', 'WebAssembly'
];

class SandboxLoader {
  constructor() {
    this.loadedPlugins = new Map();
    this.executionStats = new Map();
    this.isolates = new Map();
  }

  /**
   * Create an isolated sandbox for plugin execution
   */
  async createSandbox(pluginId, permissions = []) {
    const sandboxId = `sandbox_${pluginId}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Build allowed APIs based on permissions
    const allowedAPIs = this.buildAllowedAPIs(permissions);
    
    if (ivm) {
      return this.createIsolatedVMSandbox(sandboxId, allowedAPIs);
    } else if (VM2) {
      return this.createVM2Sandbox(sandboxId, allowedAPIs);
    } else {
      return this.createBasicSandbox(sandboxId, allowedAPIs);
    }
  }

  /**
   * Create isolated-vm sandbox (most secure)
   */
  async createIsolatedVMSandbox(sandboxId, allowedAPIs) {
    const isolate = new ivm.Isolate({ memoryLimit: SANDBOX_LIMITS.memoryLimit });
    const context = await isolate.createContext();
    
    // Get the global reference
    const jail = context.global;
    await jail.set('global', jail.derefInto());

    // Inject safe console
    await jail.set('log', new ivm.Callback((...args) => {
      console.log(`[Sandbox ${sandboxId}]`, ...args);
    }));

    // Inject allowed APIs
    for (const [name, api] of Object.entries(allowedAPIs)) {
      if (typeof api === 'function') {
        await jail.set(name, new ivm.Callback(api));
      } else {
        await jail.set(name, new ivm.ExternalCopy(api).copyInto());
      }
    }

    // Store isolate reference for cleanup
    this.isolates.set(sandboxId, isolate);

    return {
      id: sandboxId,
      type: 'isolated-vm',
      
      execute: async (code, input = {}) => {
        try {
          // Wrap code in async function
          const wrappedCode = `
            (async function() {
              const input = ${JSON.stringify(input)};
              ${code}
            })()
          `;
          
          const script = await isolate.compileScript(wrappedCode);
          const result = await script.run(context, {
            timeout: SANDBOX_LIMITS.timeout
          });
          
          return { success: true, result };
        } catch (error) {
          return { 
            success: false, 
            error: error.message,
            type: error.name
          };
        }
      },
      
      dispose: () => {
        isolate.dispose();
        this.isolates.delete(sandboxId);
      }
    };
  }

  /**
   * Create VM2 sandbox (good security, more compatible)
   */
  createVM2Sandbox(sandboxId, allowedAPIs) {
    const vm = new VM2({
      timeout: SANDBOX_LIMITS.timeout,
      sandbox: {
        console: {
          log: (...args) => console.log(`[Sandbox ${sandboxId}]`, ...args),
          error: (...args) => console.error(`[Sandbox ${sandboxId}]`, ...args),
          warn: (...args) => console.warn(`[Sandbox ${sandboxId}]`, ...args),
        },
        ...allowedAPIs
      },
      wasm: false,
      eval: false,
      fixAsync: true
    });

    return {
      id: sandboxId,
      type: 'vm2',
      
      execute: async (code, input = {}) => {
        try {
          // Inject input
          vm.sandbox.input = input;
          
          const result = vm.run(code);
          return { success: true, result };
        } catch (error) {
          return { 
            success: false, 
            error: error.message,
            type: error.name
          };
        }
      },
      
      dispose: () => {
        // VM2 doesn't need explicit disposal
      }
    };
  }

  /**
   * Create basic sandbox using Function constructor (least secure, last resort)
   */
  createBasicSandbox(sandboxId, allowedAPIs) {
    console.warn('Using basic sandbox - limited security!');
    
    return {
      id: sandboxId,
      type: 'basic',
      
      execute: async (code, input = {}) => {
        try {
          // Create restricted scope
          const scope = {
            console: {
              log: (...args) => console.log(`[Sandbox ${sandboxId}]`, ...args),
            },
            input,
            ...allowedAPIs
          };
          
          // Block dangerous globals
          const blockers = BLOCKED_GLOBALS.map(g => `var ${g} = undefined;`).join('\n');
          
          const wrappedCode = `
            "use strict";
            ${blockers}
            return (async function(scope) {
              with (scope) {
                ${code}
              }
            })(arguments[0]);
          `;
          
          // eslint-disable-next-line no-new-func
          const fn = new Function(wrappedCode);
          const result = await Promise.race([
            fn(scope),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Execution timeout')), SANDBOX_LIMITS.timeout)
            )
          ]);
          
          return { success: true, result };
        } catch (error) {
          return { 
            success: false, 
            error: error.message,
            type: error.name
          };
        }
      },
      
      dispose: () => {}
    };
  }

  /**
   * Build allowed APIs based on permissions
   */
  buildAllowedAPIs(permissions) {
    const apis = {};
    
    // Always provide basic utilities
    apis.JSON = { parse: JSON.parse, stringify: JSON.stringify };
    apis.Math = Math;
    apis.Date = Date;
    apis.Array = Array;
    apis.Object = Object;
    apis.String = String;
    apis.Number = Number;
    apis.Boolean = Boolean;
    apis.Promise = Promise;
    apis.setTimeout = (fn, ms) => setTimeout(fn, Math.min(ms, 5000));
    apis.clearTimeout = clearTimeout;

    // Permission-based APIs
    if (permissions.includes('network:fetch')) {
      apis.fetch = async (url, options = {}) => {
        // Validate URL
        try {
          const parsed = new URL(url);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('Only HTTP/HTTPS URLs allowed');
          }
        } catch (e) {
          throw new Error(`Invalid URL: ${url}`);
        }
        
        // Proxy through our fetch with limits
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000) // 10s timeout
        });
        
        return {
          ok: response.ok,
          status: response.status,
          json: async () => response.json(),
          text: async () => response.text()
        };
      };
    }

    if (permissions.includes('storage:local')) {
      const storage = new Map();
      apis.storage = {
        get: (key) => storage.get(key),
        set: (key, value) => storage.set(key, value),
        delete: (key) => storage.delete(key),
        clear: () => storage.clear()
      };
    }

    if (permissions.includes('ai:chat')) {
      apis.ai = {
        chat: async (messages) => {
          // Would proxy to our AI service
          return { message: 'AI response placeholder' };
        }
      };
    }

    if (permissions.includes('ai:embeddings')) {
      apis.ai = apis.ai || {};
      apis.ai.embed = async (text) => {
        // Would proxy to embedding service
        return { embedding: [] };
      };
    }

    return apis;
  }

  /**
   * Load and execute a plugin
   */
  async loadPlugin(pluginId, code, permissions, config = {}) {
    // Create sandbox
    const sandbox = await this.createSandbox(pluginId, permissions);
    
    // Store loaded plugin
    this.loadedPlugins.set(pluginId, {
      sandbox,
      config,
      loadedAt: new Date(),
      executions: 0
    });

    // Initialize plugin
    const initResult = await sandbox.execute(`
      const exports = {};
      ${code}
      
      if (typeof onInit === 'function') {
        onInit({ pluginId: '${pluginId}', config: ${JSON.stringify(config)} });
      }
      
      exports;
    `);

    if (!initResult.success) {
      sandbox.dispose();
      this.loadedPlugins.delete(pluginId);
      return { success: false, error: initResult.error };
    }

    return {
      success: true,
      pluginId,
      sandboxType: sandbox.type
    };
  }

  /**
   * Execute plugin function
   */
  async executePlugin(pluginId, functionName, input = {}) {
    const loaded = this.loadedPlugins.get(pluginId);
    if (!loaded) {
      return { success: false, error: 'Plugin not loaded' };
    }

    const startTime = Date.now();
    
    const result = await loaded.sandbox.execute(`
      if (typeof ${functionName} === 'function') {
        ${functionName}(input);
      } else {
        throw new Error('Function ${functionName} not found');
      }
    `, input);

    // Track stats
    loaded.executions++;
    const duration = Date.now() - startTime;
    
    if (!this.executionStats.has(pluginId)) {
      this.executionStats.set(pluginId, { total: 0, avgDuration: 0, errors: 0 });
    }
    const stats = this.executionStats.get(pluginId);
    stats.total++;
    stats.avgDuration = (stats.avgDuration * (stats.total - 1) + duration) / stats.total;
    if (!result.success) stats.errors++;

    return {
      ...result,
      duration,
      executionCount: loaded.executions
    };
  }

  /**
   * Unload plugin
   */
  unloadPlugin(pluginId) {
    const loaded = this.loadedPlugins.get(pluginId);
    if (!loaded) {
      return { success: false, error: 'Plugin not loaded' };
    }

    // Dispose sandbox
    loaded.sandbox.dispose();
    
    // Remove from loaded
    this.loadedPlugins.delete(pluginId);

    return { success: true };
  }

  /**
   * Get loader status
   */
  getStatus() {
    return {
      sandboxEngine: ivm ? 'isolated-vm' : VM2 ? 'vm2' : 'basic',
      loadedPlugins: this.loadedPlugins.size,
      activeIsolates: this.isolates.size,
      limits: SANDBOX_LIMITS,
      plugins: Array.from(this.loadedPlugins.entries()).map(([id, data]) => ({
        id,
        sandboxType: data.sandbox.type,
        loadedAt: data.loadedAt,
        executions: data.executions
      }))
    };
  }

  /**
   * Get execution stats
   */
  getStats(pluginId) {
    if (pluginId) {
      return this.executionStats.get(pluginId) || null;
    }
    return Object.fromEntries(this.executionStats);
  }

  /**
   * Cleanup all sandboxes
   */
  cleanup() {
    for (const [pluginId, loaded] of this.loadedPlugins) {
      loaded.sandbox.dispose();
    }
    this.loadedPlugins.clear();
    this.isolates.clear();
    
    return { success: true, cleaned: this.loadedPlugins.size };
  }
}

// Export singleton
const sandboxLoader = new SandboxLoader();
export default sandboxLoader;
export { SandboxLoader, SANDBOX_LIMITS };
