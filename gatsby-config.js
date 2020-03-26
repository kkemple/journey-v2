module.exports = {
  siteMetadata: {
    title: "Journey"
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-plugin-chakra-ui",
      options: {
        isUsingColorMode: false
      }
    }
  ]
};
