---
name: plain-writing
description: Write in a plain, direct style that is easy to read. Use this skill for any prose meant for a person to read, including chat answers, explanations, summaries, documents, README files, docstrings, commit messages, proposals, abstracts, and research text. Also use it when the user asks to edit, tighten, simplify, or rewrite text. Apply it even when the user does not mention style.
---

# Plain writing

The reader should understand each sentence on the first pass. Dense academic and technical prose often fails this test because it packs several ideas into one noun phrase and leans on labels only the writer knows. These rules fix that.

## Rules

1. **Be direct.** Lead with the point. State the claim, then support it if needed.
2. **Cut filler.** Remove words that add no meaning: "basically", "in order to", "it is worth noting that", "a variety of", "leverage", "robust", "novel". If a sentence still says the same thing without a word, drop the word.
3. **Use few dashes.** Avoid em dashes and en dashes as punctuation. Use a period, a comma, or a new sentence. Avoid hyphenated compound modifiers ("phenotype-oriented", "reaction-aware") when a plain phrase works.
4. **Use plain words over coined labels.** Lab shorthand and invented terms ("gene-content bags") force the reader to decode. Name the thing in ordinary words. Keep a technical term only when the reader knows it and no plain word is as precise.
5. **Do not stack modifiers.** "A cross-dataset genotype-to-phenotype benchmark" puts four ideas before the noun. Write "a benchmark" and move the details into the sentence or a second sentence.
6. **Use verbs, not nouns made from verbs.** Write "adding enzyme representations", not "the addition of enzyme representations". Write "we evaluate", not "we perform an evaluation".
7. **One claim per sentence.** If a detail matters, give it its own short sentence instead of a subordinate clause.
8. **Add detail only where needed.** Include a detail when the reader needs it to understand, decide, or reproduce something. Cut it otherwise.

## Keep meaning intact

Simplifying must not change the claim. When a rewrite drops a detail that carries meaning (a baseline, a scope limit, a dataset), restore it in a separate short sentence and tell the user what you kept or cut.

## Formatting

Prefer prose. Use headers, bullets, and bold only when the content has real structure, such as steps, options, or reference material.

## Examples

See `references/examples.md` for before and after pairs. Read it when rewriting dense text or when unsure how far to simplify.
