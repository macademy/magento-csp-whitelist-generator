<h1 align="center">Magento CSP Whitelist Generator</h1> 

<div align="center">
  <p>Google Chrome Plugin to automatically generate csp_whitelist.xml files for Magento.</p>
  <a href="https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity" target="_blank"><img src="https://img.shields.io/badge/maintained%3F-yes-brightgreen.svg?style=flat-square" alt="Maintained - Yes" /></a>
  <a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
</div>

## Table of contents

- [Sponsor](#sponsor)
- [Summary](#summary)
- [Documentation](#documentation)
- [License](#license)

## Sponsor

This course is sponsored by <a href="https://m.academy/?utm_source=github&utm_medium=social&utm_campaign=magento-csp-whitelist-generator&utm_content=text&utm_term=macademy" target="_blank">M.academy</a>, the simplest way to _master_ Magento.

<a href="https://m.academy/?utm_source=github&utm_medium=social&utm_campaign=magento-csp-whitelist-generator&utm_content=graphic&utm_term=logo" target="_blank"><img src="docs/macademy-logo.png" alt="M.academy"></a>

## Summary

This Google Chrome browser plugin makes it easy to create `csp_whitelist.xml` files for Magento. By simply installing the plugin and browsing the pages of your site, the plugin will automatically generate a whitelist of URLs that can be used to create a `csp_whitelist.xml` file for your Magento 2 site.

<img src="docs/magento-csp-whitelist-generator.png" alt="Screenshot" width="600" height="583">

Setting up `csp_whitelist.xml` files can be confusing and time-consuming. This module makes it very easy to generate a whitelist of these URLs. It's also possible that manually creating a `csp_whitelist.xml` file can be error-prone. This module helps to avoid these errors by automatically generating the whitelist for you.

## Documentation

Install the browser plugin from the Google Chrome Web Store.

Simply browse to the main pages of your Magento site (home page, category page, product page, shopping cart page, and checkout page) one-by-one. Click the Scan Current Page for each page, check the box to confirm that you scanned it, and then proceed with the next page, repeating the process until you've scanned all pages. Note that you can also scan pages that are not listed here, such as CMS pages, custom pages, or any other pages that are unique to your site which may contain external scripts.

Once you've scanned all pages, click the Complete & Generate button. This will generate a complete `csp_whitelist.xml` file, which you can then copy over to your Magento 2 site.

For more information, see the [extended documentation](https://m.academy/tools/magento-csp-whitelist-generator/?utm_source=github&utm_medium=social&utm_campaign=magento-csp-whitelist-generator&utm_content=text&utm_term=related-documentation).

## License

[MIT](https://opensource.org/licenses/MIT)

