module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        // Prevents unnecessary babel transform BigInt to number for Hermes.
        { unstable_transformProfile: 'hermes-stable' },
      ],
    ],
  };
};
