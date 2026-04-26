/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  webpack: (config, { webpack }) => {
    // alasql ships a code path that imports node fs and react-native for
    // environment detection. We only ever run it in the browser (dynamic
    // import with ssr: false). Strip these resolution paths at bundle time.
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "react-native": false,
      "react-native-fs": false,
      "react-native-fetch-blob": false,
    };
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      fs: false,
      path: false,
      perf_hooks: false,
    };
    // Silence unresolved optional require()s deep in alasql.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(react-native|react-native-fs|react-native-fetch-blob|fs|path|perf_hooks)$/,
        contextRegExp: /alasql/,
      }),
    );
    return config;
  },
};

export default nextConfig;
