<p>
  <img src="https://raw.githubusercontent.com/brenosena/render-decathlon/master/src/images/logo-decathlon-store.png" alt="Decathlon" title="Decathlon">
</p>

> Render Decathlon Store

## Install NodeJS, NPM (or Yarn) and Webpack

- [Node.js](https://nodejs.org/) - `^10.0.0`
- [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

```sh
$ npm i -g webpack webpack-cli

# or

$ yarn add global webpack webpack-cli
```

## Run project

```sh
# Clone repository
$ git clone https://github.com/brenosena/render-decathlon

# Install dependencies
$ cd render-decathlon

$ npm install

# or

$ yarn install

# Run in development mode
$ npm start

# or

$ yarn start

# Generate build files
$ npm run build

# or

$ yarn build
```

## Run tests

```sh
# ~/render-decathlon

# Tests
$ npm run test

# or

$ yarn test

# Watch tests
$ npm run test:watch

# or

$ yarn test:watch

# Code coverage
$ npm run test:coverage

# or

$ yarn test:coverage
```

## Commits

`<type>[optional scope]: <description>`

feat: a feature that is visible for end users.

fix: a bugfix that is visible for end users.

chore: a change that doesn't impact end users (e.g. chances to CI pipeline)

docs: a change in the README or documentation

refactor: a change in production code focused on readability, style and/or performance.

## Directory structure

```
📦build                       # Compiled and minified files
📦dist                        # Compiled files
📦src
┃ ┣ 📂fonts
┃ ┣ 📂html
┃ ┃ ┣ 📂checkout
┃ ┃ ┣ 📂custom-elements
┃ ┃ ┣ 📂emails
┃ ┃ ┣ 📂gtm
┃ ┃ ┣ 📂placeholders
┃ ┃ ┣ 📂prateleiras
┃ ┃ ┣ 📂subtemplates
┃ ┃ ┗ 📂templates
┃ ┣ 📂images
┃ ┣ 📂js
┃ ┃ ┣ 📂common
┃ ┃ ┃ ┣ 📂components
┃ ┃ ┃ ┗ 📂controllers
┃ ┃ ┣ 📂components
┃ ┃ ┣ 📂controllers
┃ ┃ ┣ 📜avanti-search.js
┃ ┃ ┗ 📜checkout5-custom.js
┃ ┣ 📂react
┃ ┣ 📂sass
┃ ┃ ┣ 📂components
┃ ┃ ┣ 📂core
┃ ┃ ┣ 📂landings
┃ ┃ ┣ 📂pages
┃ ┃ ┣ 📂sprites
┃ ┃ ┣ 📂vendor
┃ ┣ 📂vendor
┃ ┗ 📂vue
┣ 📜.babelrc
┣ 📜.editorconfig
┣ 📜.eslintrc.js
┣ 📜.gitignore
┣ 📜.node-version
┣ 📜.npmrc
┣ 📜.stylelintrc
┣ 📜commitlint.config.js
┣ 📜jest.config.js
┣ 📜package-lock.json
┣ 📜package.json
┣ 📜postcss.config.js
┣ 📜readme.md
┣ 📜webpack.config.common.js
┣ 📜webpack.config.dev.js
┣ 📜webpack.config.prod.js
┗ 📜yarn.lock
```

## Built with

- Node.js
- Webpack
- Babel
- ES6+
- jQuery
- React.js
- Vue.js
- SASS
- PostCSS
- Jest
- ESLint
- Stylelint
- Commitlint
- PWA
