module.exports = {
    transform: {
        ".(ts|tsx)": "ts-jest",
    },
    collectCoverage: false,
    collectCoverageFrom: ["src/**/*.ts"],
    testRegex: "src/.*.spec.ts$",
    rootDir: process.cwd(),
    moduleFileExtensions: ["ts", "js"],
};
