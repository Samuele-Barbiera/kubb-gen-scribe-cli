import { removeTrailingSlash } from "./removeTrailingSlash.js";

/**
 * Parses the appName and its path from the user input.
 *
 * Returns a tuple of of `[appName, path]`, where `appName` is the name put in the "package.json"
 * file and `path` is the path to the directory where the app will be created.
 *
 * If `appName` is ".", the name of the directory will be used instead. Handles the case where the
 * input includes a scoped package name in which case that is being parsed as the name, but not
 * included as the path.
 *
 * For example:
 *
 * - dir/@mono/app => ["@mono/app", "dir/app"]
 * - dir/app => ["app", "dir/app"]
 */
export const parseNameAndPath = (rawInput: string) => {
	const input = removeTrailingSlash(rawInput);
	const paths = input.split("/");
	const path = paths.filter(p => !p.startsWith("@")).join("/");

	return [path] as const;
};
