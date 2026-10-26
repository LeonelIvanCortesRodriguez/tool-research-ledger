# Hypothetical sample decision: choosing an OCR workflow

This example explains the method. The public release did not perform this benchmark.

## Job

Recover transaction rows from scanned statements while preserving dates, amounts, signs, and row boundaries.

## How to choose

A repository can be a strong technical fit before it is ready for production. Source documentation establishes an E0 candidate. A smoke task can establish E1. A controlled benchmark requires a fixed document, expected row-level truth, preserved output, and checks for omissions, false acceptances, fused rows, dates, amounts, and signs.

## Permitted action

Pilot the strongest candidate in an isolated workflow until controlled row-level evidence exists. Agreement between engines does not establish ground truth.

## Proof needed for promotion

Preserve the input hash, expected rows, engine output, scored exceptions, runtime, environment, and reviewer decision. Add representative statements before making a production claim.
