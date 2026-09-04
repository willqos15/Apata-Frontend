# SDD ledger — plan: docs/superpowers/plans/2026-09-03-nextjs-migration.md

Branch: feat/nextjs (base main @ 9543aba, plan commit b3c5064)
Env: node v20.19.6, npm 11.17.0. No .env.local present; remote origin github.com/willqos15/Apata-Frontend.
Spec: no separate spec file — the plan is the spec-bearing artifact (per its own header). Rulings made against plan text.

## Pre-flight conflict scan

| Pair / Task | Shared file or interface | Producer -> Consumer | Finding |
|---|---|---|---|
| T4 x T6 | src/app/page.tsx | T4 writes temporary page; T6 rewrites it | Intentional and stated in T4 Step 15. No conflict. |
| T3 x T4 | src/lib/auth.ts (useAuthToken, useIsClient) | T3 produces; T4 Navbar consumes | Names match plan self-review. OK. |
| T3 x T8 | src/lib/auth.ts | T3 produces; T8 AuthGuard consumes | OK. |
| T3 x T5,T7,T8,T9 | src/lib/api.ts (listarPets/criarPet/editarPet/deletarPet/loginAdm) | T3 produces; T5 Item, T7 login, T8 form, T9 manage consume | OK. |
| T3 x T6,T9 | src/lib/filterPets.ts + PetFilters type | T3 produces; T6 HomePets, T9 gerenciar consume | Plan renames the type PetFiltersValue where the PetFilters component is also imported. OK. |
| T5 x T6,T9 | src/components/PetFilters.tsx | T5 produces; T6 and T9 consume | Same props both sides per plan. OK. |
| T5 x T9 | src/components/Item.tsx callbacks onDelete(id,nome), onUpdate(id,FormData) | T5 produces; T9 consumes | Matches gerenciar pedirDelete/atualizar. OK. |
| T1 x T2 | eslint-config-next dependency | T1 installs; T2 config imports | Order correct. |
| T1 x T4 | react-router removed in T1, still imported by App.jsx until T4 | - | Repo does not build between T1 and T4. Stated in plan (buildable from T4). Accepted. |
| T6,T7,T8 x T9 | deletion of src/paginas/* and empty dirs | multiple tasks delete pieces | Overlapping deletes; must be idempotent (rm -f / check before delete). Ruling recorded below. |
| Each task vs itself | steps vs files | - | Self-consistent; every rewritten file given in full, placeholder scan clean. |

## Pre-flight rulings

Ruling: Overlapping deletes of src/paginas/* across T6-T9 are made idempotent — implementers must not fail when a file is already gone. Cost if wrong: a spurious task failure, trivially retried.
Ruling: T11 Step 3 (git push + gh pr create) is NOT executed by the subagent. Push to origin and PR creation are outward-facing side effects; they are surfaced to the human partner at finishing-a-development-branch instead. Cost if wrong: the human runs two commands themselves.
Ruling: T11 Step 2 (production smoke test against the real API) cannot be run — no .env.local and the real NEXT_PUBLIC_URLAPI is unknown to this session. Verification is limited to clean install, tsc --noEmit, lint and next build; the 13-item smoke checklist is handed to the human partner to run. Cost if wrong: a runtime-only regression reaches the human's manual test instead of being caught here.
Ruling: TypeScript pinned ^5.9 and ESLint ^9 as the plan specifies, not npm latest (TS 7 / ESLint 10). Cost if wrong: a later dependency bump is needed; nothing breaks now.

## Progress
Ruling: Tasks 1 and 2 batched into a single implementer dispatch (same shape: mechanical config/dependency edits, no build possible between them). Two commits still required. Cost if wrong: one review covers a slightly wider diff.
Ruling: Implementers run on opus, per the user's chosen plan-and-execute-with-fable skill (which mandates opus for execution) rather than the cheaper tier subagent-driven-development would otherwise pick. Cost if wrong: higher token spend, no quality risk.
Tasks 1+2: dispatched (BASE b3c5064).
Tasks 1+2: implementer DONE_WITH_CONCERNS (commits 6072588, bc0dbe2). Concerns are observations only: .env.local holds a placeholder URL (already covered by the pre-flight ruling), eslint 9.39.5 deprecation notice upstream, react-router still imported by 5 un-migrated files (expected until Task 4). Review dispatched.
Tasks 1+2: complete (commits b3c5064..bc0dbe2, review clean, zero findings). Reviewer independently confirmed version pins, .gitignore entries, .env.local untracked+ignored, commit trailers, and tsc --noEmit exit 0.
Carry-forward: .env.local still holds a localhost placeholder; the real NEXT_PUBLIC_URLAPI is unknown to this session (pre-flight ruling stands).
Tasks 3: dispatched (BASE bc0dbe2).
Task 3: implementer DONE_WITH_CONCERNS (commit 932d67f).
  Ruling: the implementer's extra `typeof window` guards on setToken/clearToken/subscribe (a deviation from the brief's verbatim Step 2 block) stand. The dispatch constraint "guard every localStorage/window access" is binding and the guards are required for correctness under server render; no exported name, signature or client behaviour changes. Cost if wrong: three redundant branches in auth.ts.
  Ruling: no `/busca/:termo` api function is added, despite Navbar.jsx:26 calling one today. Plan D1 deletes Navbar's search outright and Task 4 rewrites Navbar without it; server-side search is replaced by client-side filterPets. Cost if wrong: Task 4 escalates NEEDS_CONTEXT and one api function is added then.
  Pet.id kept as string: grep confirms the field name is `id` (4 hits, no `_id`); the type stays an ASSUMPTION to verify against a real API response.
Task 3: complete (commit 932d67f, review clean). Reviewer verified all 13 exports one by one against the brief, confirmed stable getServerSnapshot primitives (no render loop), no listener leak in subscribe, exact env var / storage key / auth header, no any, no ts-ignore. Only finding was the already-approved guard deviation (Minor).
Task 4: dispatched (BASE 932d67f).
Task 4: implementer DONE_WITH_CONCERNS (commit 299279c). Build green: next build exit 0, tsc --noEmit exit 0, eslint over src/**/*.{ts,tsx} exit 0. Remaining full-repo lint errors are all in un-migrated .jsx (Item.jsx -> Task 5, formulario.jsx -> Task 8).
  Ruling: the repo-root AGENTS.md and CLAUDE.md that `next dev` auto-generated must be removed from the branch and gitignored. No brief asked for them, and a repo-root CLAUDE.md silently changes how every future agent session behaves in this repo — that is the user's call, not a side effect of a build step. Cost if wrong: the files are one `git revert`/re-add away, and Next regenerates them on the next `next dev` if wanted.
  Accepted as-is: the "Failed to find font override values for WDXL Lubrifont JP N" build warning (non-fatal, font loads; no workaround per plan), and next build's reformat of tsconfig.json (plan risk 11 says commit what Next writes).
Task 4: complete (commits 932d67f..299279c, review clean — spec OK, quality approved, no Critical/Important).
  Reviewer diffed globals.css rule-by-rule against 932d67f:src/index.css + src/App.css: nothing lost, only the three font-family declarations changed to var(--font-wdxl). layout.tsx reproduces index.html + App.jsx ordering. Providers holds QueryClient in useState (not per-render). Navbar is hydration-safe via useAuthToken's null server snapshot.
  minor (deferred): Button D8 is a real visual change — old text-[${size}pt] never generated by Tailwind v4, so buttons inherited font size before and now render at the given pt. Needs a deliberate eyeball at QA.
  minor (deferred): un-migrated .jsx still pass Button's old `disable` prop and import lowercase paths (./button, ../components/alert, ../components/hero) that resolve only because macOS is case-insensitive. Harmless now (unreachable from the app router) but a live break on a Linux/Vercel build. Tasks 5-9 must fix casing and prop name as they migrate each file. CARRY FORWARD into every remaining dispatch.
  minor (deferred): next.config.ts declares no images block; the .svg static imports were not exercised under `next start`. Covered by Task 11 verification.
  Ruling stands: AGENTS.md + CLAUDE.md removal is folded into Task 5's dispatch as a cleanup step so it passes through review rather than being a controller-side fix.
Task 5: dispatched (BASE 299279c).
Task 5: implementer DONE (commits ff9bc23, e27e4d9). next build exit 0, tsc exit 0, eslint over src/**/*.{ts,tsx} exit 0 (zero errors AND zero warnings). Whole-repo lint down from 28 problems/2 errors to 19/1; the last error is formulario.jsx:147 (Task 8).
  PLAN DEFECT FOUND. Ruling: the brief's own source for Item.tsx ships `<form onSubmit={handleSubmit(salvar)}>`, which reproduces the very react-hooks/refs error the plan forbids (implementer verified by linting the brief's code verbatim first). The implementer's fix stands: `onSubmit={(e) => void handleSubmit(salvar)(e)}` with an explanatory comment and no eslint-disable. Cost if wrong: an unusual-looking form handler; behaviour is identical.
  CARRY FORWARD: Task 8's Formulario has the identical pattern at formulario.jsx:147 and needs the identical fix — the brief will be wrong there too.
  AGENTS.md/CLAUDE.md cleanup done and verified: next dev regenerates them, git status stays clean, next.config.ts untouched.
Task 5 review: dispatched (BASE 299279c).
Task 5: complete (commits 299279c..e27e4d9, review clean — spec OK, quality approved, no Critical/Important).
  Reviewer compared Item.tsx field-by-field against the 377-line original: all 6 form fields, option values/labels, error strings, the visitor description chain, the WhatsApp URL, the Scrollar timing and every className preserved; only the four intended removals went. D14 await chain verified present. The approved onSubmit deviation is correct (RHF still validates, void swallows nothing user-facing).
  Props confirmed for downstream: Item {pet, admin (REQUIRED), onDelete?(id,nome), onUpdate?(id,FormData):Promise<unknown>, onStart?, onEnd?}; PetFilters {filters, onChange} and PetFilters renders Search itself with a whole-object onChange; Poup {titulo, conteudo, show, setShow}; Search {busca, setBusca}.
  minor (deferred): PetFilters uses pageprincipal's class string including w-full; gerenciar's row had no w-full. Cosmetic width delta on /gerenciar once Task 9 wires it — flag at QA.
  minor (deferred): cancelling an Item edit does not clear fotoUp / inputFoto, so a picked-then-cancelled photo stays previewed and re-uploads on next save. Pre-existing original behaviour, faithfully ported, not introduced here.
  minor (deferred): the zoom Poup's full-size img mounts and fetches even while hidden. Pre-existing.
  minor: .gitignore's AGENTS.md/CLAUDE.md entries are unanchored — folded into Task 6's dispatch as a one-line fix (/AGENTS.md, /CLAUDE.md).
Task 6: dispatched (BASE e27e4d9).
Task 6: implementer DONE (commit 425cdf0). next build exit 0 with route table showing "f /" (Dynamic) - D15 confirmed; tsc exit 0; eslint over src/**/*.{ts,tsx} exit 0, zero errors and zero warnings. pageprincipal.jsx's 2 warnings gone with the file.
  Failing-fetch path exercised deliberately: against the dead placeholder URL, / returned 200 in 9ms with shell/asides/PIX/Hero/About rendered and fetchPetsServer returning null - the client takes over, timeout not weakened. Against a temporary local mock backend, pet markup appears in the server HTML, proving initialData seeding works end to end.
  Accepted tradeoff (D15, not a regression): / now costs a per-request backend round trip and cannot be edge-cached.
Task 6 review: dispatched (BASE e27e4d9).
Task 6: complete (commits e27e4d9..425cdf0, review clean - spec OK, quality approved, no Critical).
  Reviewer compared page.tsx + HomePets.tsx line-by-line against the 240-line pageprincipal.jsx: nothing lost. All four order utilities, both whatsapp group URLs, PIX/racao asides, forms.gle link, ids and scroll-mt preserved. Server/client boundary holds - page.tsx has no hooks/handlers/window; 'use client' only in HomePets. No hydration mismatch in either the seeded or the null-initialData path. pets-server.ts: no-store + AbortSignal.timeout(10_000), returns null instead of throwing, reads NEXT_PUBLIC_URLAPI exactly, no any.
  Query key confirmed: HomePets uses ['itens'], matching what gerenciar invalidates.
  IMPORTANT - CARRY FORWARD TO TASK 9: gerenciar.jsx:41,64 calls queryClient.invalidateQueries(["itens"]), the react-query v4 signature. v5 requires { queryKey: ['itens'] }. If Task 9 does not convert it, admin mutations silently never refresh the home list. This is plan decision D7c and it must actually land.
  minor (deferred): task-6-report.md cites a stale commit hash (6dc2b24) from a rebase; content matches 425cdf0.
  minor (deferred): rel="noopener noreferrer" added to the three target="_blank" anchors (brief-sourced security improvement, absent in the original).
Task 7: dispatched (BASE 425cdf0).
Task 7: implementer DONE_WITH_CONCERNS (commit 6a5a603). tsc exit 0; eslint over src/**/*.{ts,tsx} exit 0, zero errors and zero warnings; next build exit 0 with /painel static. Whole-repo lint 19 -> 11 problems, all in formulario.jsx (Task 8) and gerenciar.jsx (Task 9).
  Plan-defect check done properly: implementer linted the brief's source verbatim first. onSubmit={handleSubmit(login)} is clean here because login reads no ref, so no Task-5-style rewrite was needed. File is byte-for-byte the brief.
  Concern is the known env limitation only: no real POST, no browser smoke test, and a successful login lands on a 404 until Task 9 exists.
Task 7 review: dispatched (BASE 425cdf0).
Task 7: complete (review clean - spec OK, quality approved). Behaviour compared line-by-line against PainalAdm.jsx: all Portuguese UI strings unchanged, success/failure paths preserved, dead code removals genuinely unreachable. Auth round trip verified: setToken writes localStorage['token'], api.ts reads it and sends "Bearer <token>".

## HISTORY REWRITE (user-directed, 2026-09-03)
User asked to remove Claude attribution from commits. Branch was ALREADY on origin (published outside this session), so this required a force-push. User was asked and explicitly authorised both the scope and the force-push.
  Ruling: removed BOTH the Co-Authored-By: Claude line and the Claude-Session line from all 9 branch commits via git filter-branch over 9543aba..HEAD, then git push --force-with-lease. Verified: no attribution remains (only legitimate mentions of the CLAUDE.md *filename* in commit bodies), and `git diff <old-head> <new-head>` is empty - trees identical, only messages changed. Remote now at a60e32c. Cost if wrong: refs/original/ holds the pre-rewrite refs locally for recovery.
  SHA MAP (old -> new): b3c5064->4e7f314, 6072588->4ce270b, bc0dbe2->45af9a5, 932d67f->7572b80, 299279c->887aa7e, ff9bc23->a29afab, e27e4d9->a84d756, 425cdf0->49e0966, 6a5a603->a60e32c.
  FROM NOW ON: commits carry NO Co-Authored-By and NO Claude-Session trailer.

## NEW USER REQUESTS (2026-09-03, mid-execution)
User asked for two things beyond the plan:
  (a) Remove the explanatory comments the implementers added.
  (b) Portuguese function names and file names must become English.
  Ruling: both are deferred to a dedicated pass inserted as Task 9.5, after Task 9 and BEFORE Task 10 (README) and Task 11 (final verification), so those two reflect the final names. Doing it now would collide with the pt-BR names baked into the remaining briefs. Cost if wrong: one extra rename commit late instead of spread through the tasks.
  Ruling: remaining implementers are told NOT to add explanatory comments, to avoid writing what 9.5 must delete.
  USER DECISION: public route segments /cadastro, /gerenciar, /painel STAY in Portuguese - they are live URLs and renaming breaks saved links.
  USER DECISION: API field names (nome, especie, porte, sexo, contato, foto, descricao) STAY - they are the backend contract, in both the response shape and the FormData sent back. Only functions, file names and local identifiers go to English. Portuguese UI strings also stay.
Task 8: dispatched (BASE a60e32c).
Task 8: implementer DONE_WITH_CONCERNS (commit da8299d, no attribution trailers). tsc exit 0; eslint over src/**/*.{ts,tsx} exit 0 zero errors zero warnings; next build exit 0 with /cadastro listed. Whole-repo lint 11 problems (1 error) -> 8 warnings, all in gerenciar.jsx (Task 9).
  Predicted plan defect hit again and fixed the same way: brief shipped onSubmit={handleSubmit(enviar)} reproducing react-hooks/refs; fixed as onSubmit={(e) => void handleSubmit(enviar)(e)}, no eslint-disable, no comment (per the new no-comments rule).
  Guard verified LIVE (dev server + throwaway mock backend + real Chrome): logged out /cadastro redirects to /painel; logged in the form renders; validation fires; full submit succeeds with Bearer header, Portuguese field names and contato=11 digits (D9). Prerendered cadastro.html contains the spinner only - no protected markup, so no content flash. No hydration mismatch, no console errors.
  minor (deferred): after a successful submit the uncontrolled inputs keep their displayed values. RHF state does reset so no stale data is sent. Pre-existing and identical in the Vite original; correctly not changed on a straight-port task. Worth a follow-up after the migration.
Task 8 review: dispatched (BASE a60e32c).
Task 8: complete (commits a60e32c..da8299d, review clean - spec OK, quality approved, no Critical/Important).
  Guard traced through all three render states: server and hydration render the spinner only (children never reach the HTML), !isClient short-circuits before the token check so an authenticated user is never bounced, redirect fires exactly once, logout event kicks the user out. Expired/malformed token renders the form and fails at submit - faithful to Prorota, not a regression.
  Form compared line-by-line against the 276-line original: all 6 fields, all validation rules and exact Portuguese strings, option values, mode:'all', fieldset disabled, scrollIntoView timing and classNames preserved. Write path confirmed: FormData keys nome/especie/porte/sexo/descricao/file/contato with contato as 11 raw digits, header lowercase authorization: Bearer <token>. File part key is `file` (foto is the response field) - contract intact.
  minor (for Task 9.5): an explanatory LIMITATION JSDoc block survives in AuthGuard.tsx:8-13 and must be removed by the comment-cleanup pass.
  minor (deferred): Formulario's Controller render prop now actually attaches RHF's ref, so shouldFocusError focuses/scrolls the contato field on failed submit where it previously did not. Benign improvement, scope the brief did not ask for.
  minor (deferred): a double-click can still fire two POSTs in the microtask window before the disable re-render. Identical to the original (which was worse - Button's disabled was a dead prop). Worth fixing after the migration.
  IMPORTANT - CARRY FORWARD TO TASK 9: (admin)/layout.tsx renders children as a server slot, so a SERVER page's output ships in the RSC flight payload even while AuthGuard withholds it from the DOM. Task 9 must NOT fetch protected data in a server component under this route group - /gerenciar has to stay a client page.
Task 9: dispatched (BASE da8299d).
Task 9: implementer DONE_WITH_CONCERNS (commit be1aa31, no attribution trailers). tsc exit 0; `eslint .` over the WHOLE repo exit 0 with zero errors and zero warnings; next build exit 0; zero .jsx/.js left under src/, src/paginas/ gone.
  D7c proven at RUNTIME, not just read: against a mock backend in real Chrome, PUT /pets/1 was followed 2ms later by GET /pets, DELETE /pets/2 followed 7ms later by GET /pets, and client-navigating to / then showed the edited name - so the ['itens'] invalidation genuinely reaches HomePets. D14 proven by injecting a 2.5s delay into the mock's PUT: the spinner stayed mounted for the whole request and cleared only after the refetched list showed the new name. Answering "Não" on the delete Alert issued no network request.
  minor (deferred, PRE-EXISTING - exists in production today, not a migration regression): in Item.tsx the "Editar" button's onClick and the wrapper div's onClick both call editar() with no stopPropagation, so clicking that button net-closes the form. Clicking the card body opens it correctly prefilled. Faithfully preserved from the original. Worth fixing after the migration - surface to the user.
  minor (deferred, PRE-EXISTING): PatternFormat's prefix="+55 " does not display in the edit field. Submitted value is correct bare digits.
Task 9 review: dispatched (BASE da8299d).
Task 9: complete (commits da8299d..be1aa31, review clean - spec OK, quality approved, no Critical/Important).
  page.tsx is byte-identical to the brief. Both invalidateQueries call sites use the v5 { queryKey: ['itens'] } form and grep proves no bare-array v4 form survives; key matches HomePets.tsx exactly. 'use client' confirmed, layout is a 5-line server wrapper with no fetch, so nothing protected reaches the RSC flight payload.
  Delete flow traced end to end: the Apagar button stopPropagations and passes ITS OWN card's id; pedirDelete stores {id,nome} as one atomic object (the original's separate delid/delnome pair was the stale-closure hazard and it is gone); confirmarDelete reads the current render's target. The confirmed pet IS the deleted pet. "Não" unmounts with zero network activity. Double-click on "Sim" cannot double-fire. A failed delete never claims success.
  minor (deferred): the original's Array.isArray(data) guard became data ?? [], so a non-array API response would throw instead of rendering empty. Plan-mandated; HomePets.tsx does the same.
  minor (deferred): mutationDelete has no onError, so a failed delete is silent. Faithful to the original.
Task 9.5: brief written by the controller (not from the plan - added at the user's mid-execution request). Dispatched (BASE be1aa31).

## AUTHORSHIP FIX (user-directed, pending)
All 11 branch commits were authored as "Rod Andrade <rodrigoandradebccgmail.com@192.168.15.94>" - a git-fabricated <macos-username>@<host> address, because user.email was unset at commit time and user.name is unset in every scope (the name came from the macOS GECOS field). GitHub does not attribute these commits to the user.
  Set git config --local user.name="Rodrigo Andrade" and user.email="rodrigoandradebcc@gmail.com" so Task 9.5's commit and everything after lands correct.
  User authorised rewriting author AND committer on the 11 existing branch commits plus a second force-push. DEFERRED until Task 9.5's implementer finishes - filter-branch on a tree another agent is actively editing would corrupt its work.
  main's commits (William Queiroz de Oliveira Souza <willqos15@gmail.com>) MUST NOT be touched - different person, and the rewrite range stays 9543aba..HEAD.
Task 9.5: implementer DONE (commit 64d4fb1, later rewritten to 8d2adf2). tsc exit 0; eslint . exit 0 zero errors zero warnings; next build exit 0 with route table unchanged (/ still dynamic); full browser drive of /painel -> /cadastro -> /gerenciar against a mock backend.
  Strongest evidence: a scripted multiset diff of every string literal and every JSX text node in src proves zero UI text and zero data values changed - the only literal deltas are two import paths and two strings that lived inside deleted comments. Captured FormData keys: create ["nome","especie","porte","sexo","descricao","file","contato"], edit ["nome","descricao","especie","porte","sexo","contato"] - Portuguese, original order, Bearer header intact.
  Three implementer judgement calls, all cheap to reverse: renamed the internal PetFilters interface fields (busca/especie/sexo/porte -> search/species/sex/size) since that is pure client state never serialised; did NOT rename Item's destructured pet bindings (they are the A1-frozen field names feeding the reset({...}) shorthand that produces FormData keys); did NOT rename status-union members ('inicio','erro',...) reading A2 categorically.
  minor (for Task 10): README.md:84 still references Formulario, and Popup needs updating too.
  minor (deferred, PRE-EXISTING, same root cause as the known Editar double-toggle): clicking Salvar in Item also bubbles to the wrapper onClick and collapses the form. Submit still works - verified with a real mouse click.

## AUTHORSHIP FIX - DONE
Rewrote author AND committer on all 12 branch commits via filter-branch --env-filter over 9543aba..HEAD, conditional on the bogus address so nothing else could be caught. All now "Rodrigo Andrade <rodrigoandradebcc@gmail.com>". Verified: `git diff <pre-rewrite-head> HEAD` empty (trees identical), no bogus email left on the branch, main's willqos15 commits untouched. Force-pushed. Deleted refs/original so the stale bogus-email objects stop showing in --all; the reflog still holds them for recovery.
  New SHA map (post-attribution-rewrite -> post-authorship-rewrite): 4e7f314->633b574, 4ce270b->a1f70bf, 45af9a5->67b437c, 7572b80->4c51e8b, 887aa7e->9c35353, a29afab->94bcc74, a84d756->ccb4c3b, 49e0966->7fbda6b, a60e32c->609bfd6, da8299d->b383cbf, be1aa31->58ae88c, 64d4fb1->8d2adf2.
  OBSERVATION: the remote was found at be1aa31 before this push - commits reached GitHub without the controller pushing them. Something in the user's environment (likely IDE auto-push) publishes this branch. Flagged to the user.
Task 9.5 review: dispatched (BASE 58ae88c).
Task 9.5: complete (commits 58ae88c..8d2adf2, review clean - spec OK, quality approved, no Critical/Important).
  Reviewer independently re-derived the string-literal equivalence using the repo's own TypeScript compiler API rather than trusting the report: 929 literal tokens each side, exactly two differ (the two renamed import paths). Then ran a stronger check the implementer had not - a full AST structural fingerprint per file with identifiers erased: 28 of 31 files structurally byte-identical; the only deltas are the two import strings and 3 removed JSX comment nodes. No statement, argument, operator or branch changed anywhere. Conclusive proof of zero behaviour change at source level.
  Frozen-name audit all clean: Pet fields, data values, FormData keys AND their append order ('file' still sixth), every RHF register() name, the ['itens'] key at all 4 sites, NEXT_PUBLIC_URLAPI, TOKEN_KEY, Bearer, apata-auth-change, --font-wdxl, and the three Portuguese route directories.
  All three implementer judgement calls confirmed right, each traced rather than accepted.
  Five naming minors raised - folded into Task 10's dispatch as a cleanup: hasPhotoError() calls a setter (should be validatePhoto), GroupButton is the join-WhatsApp CTA not a button group, goToCreatePage is vague, photoInput/fileInput name the same thing differently across two files, Popup uses show/setShow while Alert uses open.
Task 10: dispatched (BASE 8d2adf2), with the five naming fixes folded in.
Task 10: implementer DONE_WITH_CONCERNS (commits 95877ef naming cleanup, 0aaa21c README). tsc exit 0; eslint . exit 0 zero errors zero warnings; next build exit 0 with route table unchanged (f /, o /_not-found, o /cadastro, o /gerenciar, o /painel); comment grep still returns nothing; both no-img-element disables intact.
  Deploy checklist went into README.md as "## Deploy na Vercel" under Instalacao, so the NEXT_PUBLIC_URLAPI build-time warning sits next to the .env.local step it mirrors. No Vercel action attempted, no CLI, no guessed URL.
  Ruling: the reviewer-requested rename to validatePhoto() left the function returning true on FAILURE, so `if (validatePhoto()) return` reads backwards. Inverting it is behaviour-neutral but changes an expression rather than an identifier, which was out of scope for a rename task. Folded into Task 11 as an explicit step-0 so the final whole-branch review covers it. Cost if wrong: one more small commit.
  OUTSTANDING HUMAN ACTIONS (Vercel, cannot be done from this session): set NEXT_PUBLIC_URLAPI for Production/Preview/Development BEFORE the first build of this branch - a missing value deploys green and silently shows no pets; clear any "Output Directory: dist" / Build Command override and flip Framework Preset off Vite; delete VITE_URLAPI after merge.
Task 11: dispatched (BASE 0aaa21c), with the validatePhoto inversion folded in as step 0 and push/PR explicitly withheld.
Task 11: complete (commit 949289d, the step-0 isPhotoValid inversion; no migration regression found).
  13/13 checklist items PASSED, 0 failed, 0 not-exercisable, run in PRODUCTION mode (next build + next start) against a throwaway mock, driven in real Chrome.
  Extra checks all passed: all four routes render in prod; / is dynamic and streams (shell at 0.00s, pets at 2.99s with a 3s backend delay); with the backend KILLED the shell still returns 200 in 12ms with no crash; guard redirects both admin routes with zero protected markup in the prerendered HTML; edit and delete each fire the ['itens'] refetch and the change shows on /; zero console messages and zero page errors on every route logged in and out (canary-verified capture); local next/image assets and the PIX QR render.
  Case-sensitivity audit (the Linux/Vercel risk flagged back at Task 4): 61 local import specifiers checked twice - real readdir casing, then cross-checked against the git index. 0 mismatches. No case-only duplicate filenames, favicon matches disk.
  Clean build from scratch: rm -rf node_modules .next, npm ci, typecheck 0 / lint 0 zero warnings / build 0. git status clean afterwards - Next did not mutate tsconfig.json this time. Only warning is the pre-existing WDXL font-override notice.
  Pre-existing bugs reproduced and left unfixed as instructed: Editar bubbling no-op, missing +55 prefix.
  Push and PR deliberately NOT done, per the pre-flight ruling.
FINAL WHOLE-BRANCH REVIEW: dispatched.

## FINAL WHOLE-BRANCH REVIEW - verdict: SHIP WITH FIXES
Architecture confirmed as delivered: real streaming (non-async server page, async PetsFromServer inside Suspense), no-store + 10s abort returning null instead of throwing, initialData seeding on the same ['itens'] key both invalidation sites use (v5 object form, no v4 array form left), client-only /gerenciar so nothing protected enters the flight payload, useSyncExternalStore auth used consistently. No dead files, no orphaned imports, no unused exports or assets. Zero comments in src, only the two sanctioned eslint-disables.
Three findings to fix before merge:
  1. IMPORTANT (MIGRATION-INTRODUCED REGRESSION) HomePets.tsx:25 and gerenciar/page.tsx:56 use `data ?? []` where the Vite original guarded with Array.isArray. pets-server.ts:15 KEPT the guard, so the server path is defended and the client path is not, in the same feature. A 200 carrying {"error":...} or a paginated envelope throws "pets.filter is not a function" during render.
  2. IMPORTANT no app/error.tsx anywhere, so nothing catches finding 1 or any client throw. The Vite SPA had no boundary either but it did have the array guard, so the pair is a net regression.
  3. IMPORTANT (pre-existing, but the failure is data corruption) PetForm.tsx:110's "Escolha sua imagem" Button passes no type, and Button.tsx:19 forwards type={undefined}, so it is a native submit inside the form. An admin clicking it to swap a photo CREATES A DUPLICATE PET.
Ledger triage: everything else marked carry. Two ledger corrections from the reviewer - the "Salvar also bubbles and collapses the form" entry DOES NOT REPRODUCE (the onClick div closes at Item.tsx:184, the form opens at 213 as a sibling), and ASSUMPTION #3 (digits-only contato) is RETIRED - the Vite original already sent bare digits, so the port is byte-equivalent in what it sends.
Real-API risk lower than feared: a numeric Pet.id breaks nothing at runtime (key + URL interpolation only); _id is disproven by the Vite app using pet.id in production today. The genuinely untested surface is the NEW server-to-backend hop from Vercel (IP allowlists, self-signed certs, http:// origin) - blast radius bounded because pets-server.ts swallows it and the client takes over.
Deploy gap not in the README: rotating NEXT_PUBLIC_URLAPI needs a REDEPLOY (inlined at build time in both bundles), and an http:// backend URL means client axios calls are blocked as mixed content from the https Vercel origin while the server-side home fetch still succeeds - pets render on first paint and every mutation fails.
FIX WAVE: dispatched (BASE 949289d).
FIX WAVE: DONE (commits 8672f66 guard, 7b33fcc error boundary, fa7c1e8 Button type). tsc 0, eslint . 0 zero warnings, next build 0, route table unchanged, comment grep still empty, both eslint-disables intact.
  Each finding was reproduced BEFORE being fixed, which is the evidence that matters:
  1. old code threw "e.filter is not a function" and blanked / and /gerenciar; with the guard, {"error":"boom"}, {data:[...]} and a keyed-object response all render "Nenhum animal encontrado." on both routes.
  2. forced a real client throw: boundary rendered inside the layout, the canary string absent from the DOM but present in console.error, reset() recovered the page in place with no reload.
  3. negative control with type stripped fired a real POST /pets and "Cadastro feito com sucesso!" - the duplicate-record bug reproduced; with the fix the identical click gives 0 submits and retains form values. All 12 Button call sites audited; login/create/edit already passed type="submit" explicitly so nothing needed adding, and all three forms were re-confirmed to submit.
  Harness caveat: CDP coordinate clicks silently no-op'd in this session, so load-bearing assertions used in-page element.click(), each verified against a working/failing pair.
SCOPED RE-REVIEW: dispatched (FIX_BASE 949289d).
