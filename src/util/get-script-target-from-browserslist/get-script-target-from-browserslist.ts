import {getAppropriateEcmaVersionForBrowserslist} from "@wessberg/browserslist-generator";
import {TS} from "../../type/ts";

/**
 * Gets the ScriptTarget to use from the given Browserslist
 */
export function getScriptTargetFromBrowserslist(browserslist: string[], typescript: typeof TS): TS.ScriptTarget {
	switch (getAppropriateEcmaVersionForBrowserslist(browserslist)) {
		case "es3":
			return typescript.ScriptTarget.ES3;
		case "es5":
			return typescript.ScriptTarget.ES5;
		case "es2015":
			return typescript.ScriptTarget.ES2015;
		// Support older TypeScript versions that may not supported ES2016 as a ScriptTarget with nullish coalescing
		case "es2016":
			return typescript.ScriptTarget.ES2016 ?? typescript.ScriptTarget.ES2015;
		// Support older TypeScript versions that may not supported ES2016 as a ScriptTarget with nullish coalescing
		case "es2017":
			return typescript.ScriptTarget.ES2017 ?? typescript.ScriptTarget.ES2016 ?? typescript.ScriptTarget.ES2015;
		// Support older TypeScript versions that may not supported ES2016 as a ScriptTarget with nullish coalescing
		case "es2018":
			return typescript.ScriptTarget.ES2018 ?? typescript.ScriptTarget.ES2017 ?? typescript.ScriptTarget.ES2016 ?? typescript.ScriptTarget.ES2015;
		// Support older TypeScript versions that may not supported ES2016 as a ScriptTarget with nullish coalescing
		case "es2019":
			return (
				typescript.ScriptTarget.ES2019 ??
				typescript.ScriptTarget.ES2018 ??
				typescript.ScriptTarget.ES2017 ??
				typescript.ScriptTarget.ES2016 ??
				typescript.ScriptTarget.ES2015
			);
		// Support older TypeScript versions that may not supported ES2016 as a ScriptTarget with nullish coalescing
		case "es2020":
			return (
				typescript.ScriptTarget.ES2020 ??
				typescript.ScriptTarget.ES2019 ??
				typescript.ScriptTarget.ES2018 ??
				typescript.ScriptTarget.ES2017 ??
				typescript.ScriptTarget.ES2016 ??
				typescript.ScriptTarget.ES2015
			);
	}
}

/**
 * Gets the EcmaVersion that represents the given ScriptTarget
 */
export function getEcmaVersionForScriptTarget(
	scriptTarget: TS.ScriptTarget,
	typescript: typeof TS
): "es3" | "es5" | "es2015" | "es2016" | "es2017" | "es2018" | "es2019" | "es2020" {
	switch (scriptTarget) {
		case typescript.ScriptTarget.ES3:
			return "es3";
		case typescript.ScriptTarget.ES5:
			return "es5";
		case typescript.ScriptTarget.ES2015:
			return "es2015";
		case typescript.ScriptTarget.ES2016:
			return "es2016";
		case typescript.ScriptTarget.ES2017:
			return "es2017";
		case typescript.ScriptTarget.ES2018:
			return "es2018";
		case typescript.ScriptTarget.ES2019:
			return "es2019";
		case typescript.ScriptTarget.ES2020:
		case typescript.ScriptTarget.ESNext:
		case typescript.ScriptTarget.JSON:
			return "es2020";
	}
}
