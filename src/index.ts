import { IField, IMeta } from './interface';
import * as babelParser from '@babel/parser';
import {
  isTSInterfaceDeclaration,
  isExportNamedDeclaration,
  isClassDeclaration
} from '@babel/types';
import fs from 'fs';
import { parseTsInterfaceDeclaration, parseClassDeclaration } from './parser';

export function parse(filePath: string, name: string, isWeb: boolean): IField[] {
  if (isWeb) {
    require('fs-web').readString(filePath).then((fileStr): any => {
      const ast = babelParser.parse(fileStr, {
        sourceType: 'module',
        plugins: ['typescript', 'classProperties']
      });
      for (let node of ast.program.body) {
        if (isExportNamedDeclaration(node)) {
          node = node.declaration;
        }
        if (isTSInterfaceDeclaration(node) && node.id.name === name) {
          return parseTsInterfaceDeclaration(node);
        }
        if (isClassDeclaration(node) && node.id.name === name) {
          return parseClassDeclaration(node);
        }
      }
    });
  } else {
    const ast = babelParser.parse(fs.readFileSync(filePath).toString(), {
      sourceType: 'module',
      plugins: ['typescript', 'classProperties']
    });
    for (let node of ast.program.body) {
      if (isExportNamedDeclaration(node)) {
        node = node.declaration;
      }
      if (isTSInterfaceDeclaration(node) && node.id.name === name) {
        return parseTsInterfaceDeclaration(node);
      }
      if (isClassDeclaration(node) && node.id.name === name) {
        return parseClassDeclaration(node);
      }
    }
  }
  return null;
}

export function getFieldMeta(field: IField, language?: string): IMeta {
  const { meta, name, optional, types } = field;
  const baseInfo = {
    name,
    optional,
    types
  };
  if (!meta) {
    return baseInfo;
  }
  return Object.assign(baseInfo, meta.base, meta.i18n[language]);
}
