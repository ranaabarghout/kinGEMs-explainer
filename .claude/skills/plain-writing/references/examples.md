# Before and after examples

## Research contribution statement

**Before:** This contribution extends ZymeDB with a phenotype-oriented metadata layer and uses it to build a cross-dataset genotype-to-phenotype benchmark that tests whether reaction-aware enzyme representations generalize where gene-content bags fail.

**After:** This contribution extends ZymeDB with phenotype metadata and uses it to build a benchmark that tests whether adding enzyme representations improves the prediction of organism phenotypes.

**If the dropped details matter, add one sentence:** We compare against models that use gene content alone and test across datasets.

What changed:
- "phenotype-oriented metadata layer" became "phenotype metadata" (fewer modifiers, no hyphen).
- "cross-dataset genotype-to-phenotype benchmark" became "a benchmark" (no stacked modifiers).
- "gene-content bags" was removed as lab shorthand, then restored in plain words in a separate sentence.
- "the addition of" became "adding" (verb over noun).

## Methods sentence

**Before:** In order to facilitate a robust evaluation of model performance, we perform a stratified splitting of the data across a variety of taxonomic levels.

**After:** We split the data by taxonomic level so the test set contains organisms the model has not seen.

What changed: filler removed ("in order to facilitate", "robust", "a variety of"), "perform a splitting" became "split", and the vague purpose became a concrete one.

## Chat answer

**Before:** Great question! It's worth noting that there are a few different approaches you could potentially take here — each with its own tradeoffs — but generally speaking, the most common one tends to be fine-tuning.

**After:** Fine-tuning is the usual approach. It works best when you have a few thousand labeled examples.

What changed: no preamble, no dashes, no hedging, and a useful detail in place of a vague one.
