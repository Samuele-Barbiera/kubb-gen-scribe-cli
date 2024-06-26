import path from "node:path";

import fs from "fs-extra";
import { PKG_ROOT } from "~/consts";
import type { AvailableDependencies } from "~/src/installers/dependencyVersionMap";
import type { Installer } from "~/src/installers/index.js";
import { addPackageDependency } from "~/src/utils/addPackageDependency";

export const dynamicKubbTanstackInstaller: Installer = ({ projectDir, packages }) => {
	const deps: AvailableDependencies[] = [
		"@kubb/swagger-tanstack-query",
		"@kubb/core",
		"@kubb/swagger-ts",
		"@kubb/swagger",
		"@kubb/react",
		"@kubb/swagger-client",
	];

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});

	const sourceTemplatesDir = path.join(PKG_ROOT, "templates/tanstack-query");
	fs.copySync(sourceTemplatesDir, path.join(projectDir, "api/templatesSDK"));

	const tanstackFileContent = [
		"import { defineConfig } from '@kubb/core';",
		"import { definePlugin as createSwagger } from '@kubb/swagger';",
		"import { definePlugin as createSwaggerTanstackQuery } from '@kubb/swagger-tanstack-query';",
		"import { definePlugin as createSwaggerTS } from '@kubb/swagger-ts';",

		"import * as mutation from './api/templatesSDK/mutate/index';",
		"import * as operations from './api/templatesSDK/operations/index';",
		"import * as queryKey from './api/templatesSDK/queryKey/index';",

		"export default defineConfig(async () => {",
		"	return {",
		"root: '.',",
		"input: {",
		`path:  '${packages?.kubbTanstack.importSwaggerFilePath.replace(".yaml", "_updated.yaml")}'`,
		"},",
		"output: {",
		"path: './api/gen',",
		"},",
		"plugins: [",
		"createSwagger({ output: false }),",
		"createSwaggerTS({",
		"output: {",
		"path: 'models',",
		"},",
		"}),",
		"createSwaggerTanstackQuery({",
		"transformers: {",
		"name: (name: string, type?: 'function' | 'type' | 'file' | undefined) => {",
		"if (type === 'file' || type === 'function') {",
		"return `${name}Hook`;",
		"}",
		"return name;",
		"},",
		"},",
		"output: {",
		"path: './hooks',",
		"},",
		"framework: 'react',",
		"query: {",
		"queryKey: keys => ['\"v5\"', ...keys],",
		"},",
		"suspense: {},",
		"override: [",
		"{",
		"type: 'operationId',",
		"pattern: 'findDataByTags',",
		"options: {",
		"dataReturnType: 'full',",
		"infinite: {",
		"queryParam: 'pageSize',",
		"initialPageParam: 0,",
		"cursorParam: undefined,",
		"},",
		"templates: {",
		"queryKey: queryKey.templates,",
		"},",
		"},",
		"},",
		"{",
		"type: 'operationId',",
		"pattern: 'updateDataWithForm',",
		"options: {",
		"query: {",
		"queryKey: (key: unknown[]) => key,",
		"methods: ['post'],",
		"},",
		"},",
		"},",
		"],",
		"templates: {",
		"operations: operations.templates,",
		"mutation: mutation.templates,",
		"},",
		"}),",
		"],",
		"};",
		"});",
	].join("\n");

	const kubbTanstackConfigDest = path.join(projectDir, "kubb.config.ts");
	fs.writeFileSync(kubbTanstackConfigDest, tanstackFileContent, "utf-8");
};
