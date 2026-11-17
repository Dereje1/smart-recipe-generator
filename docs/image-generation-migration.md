# Recipe image generation migration — November 17, 2026

## Cause and scope

The supplied Vercel logs show `/api/save-recipes` failing with HTTP 400:
`The model 'gpt-image-1' does not exist.`
OpenAI confirms that [GPT Image 1 shut down on October 23, 2026](https://developers.openai.com/api/docs/models/gpt-image-1).
This explains the error without assuming an account permission failure. Production
credentials and project access have not been inspected or exercised.

Commit `2d41dbd` introduced the `gpt-image-1` default and base64 upload support.
The existing flow remains: generate recipes → select recipes → generate one image
per selection → decode PNG data URI → upload buffer to S3 → insert recipes into
MongoDB → start background tagging. An image error occurs before S3 or recipe insertion;
the existing generic HTTP 500 response is preserved.

## Model and API decision

Use [GPT-Image-2.5 Flare](https://developers.openai.com/api/docs/models/gpt-image-2.5-flare),
one of the replacements recommended by the [Images API reference](https://developers.openai.com/api/reference/resources/images/methods/generate).
Flare targets fast, high-quality everyday generation; [Sunburst](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst)
targets editing precision, which this workflow does not need. Both list $5 per
million text input tokens and $30 per million image output tokens; retired Image 1
listed $40 per million image output tokens. Actual cost and latency depend on
output token consumption and have not been measured. No per-image savings are assumed.
The [deprecation list](https://developers.openai.com/api/docs/deprecations) schedules
Image 1 mini and Image 1.5 for December 1, 2026, so they are poor migration targets.

Keep `openai.images.generate()` (`POST /v1/images/generations`), `n: 1`,
`size: '1024x1024'`, and the existing prompts. Explicitly request `output_format: 'png'`
to match the existing data URI prefix and S3 `ContentType`. GPT Image returns
`data[0].b64_json`; do not add the unsupported `response_format` parameter.
The installed SDK accepts a string model and PNG output format, so no dependency
upgrade, Responses API migration, fallback model, or extra request is needed.
Existing response validation, URL handling, image-log summaries, S3 keys (full
client `openaiPromptId`), stored S3 URLs, prompt-ID normalization, and MongoDB
insertion remain unchanged.

## Deployment and manual verification

- Remove any Vercel `OPENAI_IMAGE_MODEL=gpt-image-1` override or change it to
  `gpt-image-2.5-flare` in the deployed environment, then redeploy.
- Confirm that the production API project has model access, billing, and any
  required [organization verification](https://developers.openai.com/api/docs/guides/image-generation).
  These are deployment checks; no live API requests were made during development.
- After deployment, generate recipes, select one or several, and save. Confirm
  HTTP 200, navigation back to Profile, and visible images after refresh.
- Confirm PNG objects exist under the original prompt-ID-plus-index keys and
  MongoDB stores the matching S3 URLs, owner, and normalized prompt ID.
- Check Vercel logs for successful saves and absence of model-not-found errors.
  In a controlled environment, simulate an image failure: expect the existing
  generic save error and no recipe insert or S3 upload for that save.

## Automated coverage

`tests/pages/api/save-recipes-images.test.ts` uses the installed OpenAI SDK with
Nock HTTP interception, an AWS client mock, and mocked database operations. It
checks request serialization, PNG decoding, S3 bytes/metadata/keys, persisted
recipe fields, image-log summaries, and API/missing-image failures. Existing
OpenAI, S3, and save-route tests cover the surrounding behavior. No external
OpenAI, AWS, or MongoDB service is used by these tests; live access and visual
quality remain manual checks.

Validation on Node 20.15.0: `npm run compileTS`, `npm run lint`, `npm run build`
(placeholder OpenAI key and local MongoDB URI), and `npm run all_tests -- --runInBand`
passed: 52 suites, 276 tests, 16 snapshots. The image regression assertion failed
before the implementation change. Cypress ran on isolated port 3107 because
3000 was occupied: 11 passed, 2 failed. `createRecipe.cy.ts` could not find
`Test-Ingredient-2` before generation/save; the clipboard test expected a
hardcoded port-3000 URL instead of the port-3107 URL. These unchanged UI/test
issues are outside this migration; the full browser suite is not green.
