# Taste Manifest Schema

The `.claude/taste-manifest.json` file provides explicit configuration for taste evaluation.

## Full Schema

```json
{
  "version": "1.0.0",

  "eval_files": [
    "CONTENT-QUALITY-EVALS.md",
    "UX-QUALITY-EVALS.md"
  ],

  "category_weights": {
    "content": 0.6,
    "ux": 0.4
  },

  "quality_gates": {
    "ship": 4.0,
    "polish": 3.0,
    "fix": 2.5
  },

  "custom_dimensions": [
    {
      "name": "brand_consistency",
      "category": "brand",
      "weight": 0.3,
      "floor": 3.0,
      "description": "Output matches brand voice guidelines"
    }
  ]
}
```

## Field Descriptions

### version (required)
Schema version. Currently `"1.0.0"`.

### eval_files (optional)
Array of eval file paths relative to project root. If omitted, discovers via convention.

### category_weights (optional)
How to weight different categories when computing overall score. Must sum to 1.0.

Default: Equal weight across all discovered categories.

### quality_gates (optional)
Thresholds for ship decisions:

| Gate | Default | Meaning |
|------|---------|---------|
| ship | 3.5 | Score >= this: ready to ship |
| polish | 2.5 | Score >= this: polish then ship |
| fix | 2.5 | Score < this: fix before ship |

### custom_dimensions (optional)
Additional dimensions not defined in eval files. Useful for project-specific criteria.

## Validation Rules

1. `version` must be present
2. `category_weights` values must sum to 1.0
3. `quality_gates.ship` >= `quality_gates.polish` >= `quality_gates.fix`
4. `custom_dimensions[].weight` must be between 0 and 1
5. `custom_dimensions[].floor` must be between 1 and 5

## Example: Content-Heavy Project

```json
{
  "version": "1.0.0",
  "category_weights": {
    "content": 0.7,
    "ux": 0.3
  },
  "quality_gates": {
    "ship": 4.0,
    "polish": 3.5,
    "fix": 3.0
  }
}
```

## Example: UX-Heavy Project

```json
{
  "version": "1.0.0",
  "category_weights": {
    "ux": 0.8,
    "content": 0.2
  }
}
```
