module.exports = {
    extends: 'stylelint-config-recommended-scss',
    plugins: [
        'stylelint-high-performance-animation'
    ],
    rules: {
        'plugin/no-low-performance-animation-properties': true,
        'unit-whitelist': ['px', '%', 'rem', 's', 'ms', 'deg', 'vw', 'vh'],
        'selector-max-specificity': '0,4,0',
        'selector-max-type': 0,
        'selector-max-attribute': 0,
        'at-rule-blacklist': ['font-face', 'import'],
        'property-blacklist': [
            'perspective',
            'backface-visibility',
            'mask',
            'mask-image',
            'mask-border',
            'clip-path'
        ],
        'function-url-scheme-whitelist': '/^\.\//',
        'function-url-no-scheme-relative': true,
        'selector-class-pattern': '^((?!markup|page__|typo|grid).)*$'
    },
    ignoreFiles: [
        'hosts/**/*.min.css',
        'hosts/**/*.css.gz',
        'hosts/**/*.yaml'
    ]
};
