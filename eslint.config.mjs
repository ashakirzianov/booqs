import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import stylisticTs from '@stylistic/eslint-plugin-ts'
import parserTs from '@typescript-eslint/parser'

const eslintConfig = [
    ...coreWebVitals,
    ...nextTypescript,
    {
        plugins: {
            '@stylistic/ts': stylisticTs
        },
        languageOptions: {
            parser: parserTs,
        },
        rules: {
            // React Compiler rules produce false positives on valid patterns this project uses
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/refs': 'off',
            'react-hooks/preserve-manual-memoization': 'off',
            '@stylistic/ts/semi': ['error', 'never'],
            'prefer-const': ['error', {
                destructuring: 'all'
            }],
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
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                    args: 'after-used'
                }
            ],
        }
    },
]

export default eslintConfig

