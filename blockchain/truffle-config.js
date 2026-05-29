module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost
      port: 8545,            // Geth RPC port
      network_id: "1337",    // Must match your genesis.json
      gas: 4000000,          // Avoid gas issues
      gasPrice: 20000000000, // 20 Gwei (safe default)
    },
  },

  compilers: {
    solc: {
      version: "0.5.16",     // Compatible with your Geth chain
      settings: {
        optimizer: {
          enabled: false,
        },
      },
    },
  },
};