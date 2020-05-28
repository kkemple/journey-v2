module.exports = {
  siteMetadata: {
    title: "Journey",
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    "gatsby-theme-apollo",
    {
      resolve: "gatsby-plugin-chakra-ui",
      options: {
        isUsingColorMode: false,
      },
    },
  ],
};
