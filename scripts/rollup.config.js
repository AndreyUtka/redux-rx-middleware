const chalk = require("chalk");
const { writeFile } = require("fs");
const { exec } = require("child_process");
const { promisify } = require("util");
const { rollup } = require("rollup");
const resolve = require("rollup-plugin-node-resolve");
const { compile } = require("google-closure-compiler-js");

const writeFileAsync = promisify(writeFile);
const execAsync = promisify(exec);

execAsync(`mkdir -p dist/umd`)
    .then(() =>
        rollup({
            input: "./dist/esm/index.js",
            external: ["rxjs"],
            plugins: [resolve()],
        })
    )
    .then((bundle) =>
        bundle.generate({
            format: "iife",
            name: "ReduxRxMiddleware",
            globals: {
                rxjs: "Rx",
            },
        })
    )
    .then(({ code }) =>
        compile({
            languageIn: "ES5",
            applyInputSourceMaps: false,
            jsCode: [{ src: code }],
        })
    )
    .then(({ compiledCode }) => writeFileAsync("./dist/umd/index.js", compiledCode))
    .then(() => console.log(chalk`{green compiled}`))
    .catch((error) => console.log(chalk`{red ${error}}`));
