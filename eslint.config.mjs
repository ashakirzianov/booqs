import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import stylisticTs from '@stylistic/eslint-plugin-ts'
import parserTs from '@typescript-eslint/parser'


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

// TODO: use new config style?
const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        plugins: {
            '@stylistic/ts': stylisticTs
        },
        languageOptions: {
            parser: parserTs,
        },
        rules: {
            '@stylistic/ts/semi': ['error', 'never'],
            'no-iterator': 'off',
            'react/no-children-prop': 'off',
            'quotes': [
                'error',
                'single',
                {
                    'avoidEscape': true,
                    'allowTemplateLiterals': true
                }
            ],
        }
    },
]

export default eslintConfig

