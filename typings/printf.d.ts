// Type definitions for printf v0.2.3
// Project: https://www.npmjs.com/package/printf
// Definitions by: Jason Heard <https://github.com/101100>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "printf" {

    /**
     * Formats a string in a manner similar to the C printf function.
     *
     * @param {string} formatString
     *     The format string.
     * @param {any[]} formatArguments
     *     The arguments to be used in the format string.
     */
    export default function printf(formatString: string, ...formatArguments: any[]): void;

}
