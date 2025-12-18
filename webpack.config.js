const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: []
    }
  }, argv);

  // Add a rule for WebAssembly files
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'asset/resource'
  });

  return config;
};
