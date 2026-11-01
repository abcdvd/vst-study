(() => {
  'use strict';

  const C = window.STUDY_CONFIG;
  const M = window.STUDY_MANIFEST;
  // 문항 계획 (tools/make_plan.py 가 만든 docs/plan.js). questions 가 있으면 모든 참가자가 같은 문항을 풀고 순서·A/B 위치만 섞인다.
  // mode "balanced" 면 참가자마다 묶음별로 비교 방법 하나당 빠른 영상 쌍 1개 + 느린 영상 쌍 1개를 뽑는다 (buildQuestions)
  const PLAN = window.STUDY_PLAN && (Array.isArray(window.STUDY_PLAN.questions) || window.STUDY_PLAN.mode === 'balanced')
    ? window.STUDY_PLAN : null;
  const BALANCED = !!(PLAN && PLAN.mode === 'balanced');
  const app = document.getElementById('app');
  const pageUrl = new URL(location.href);
  const qp = pageUrl.searchParams;
  const DEBUG = qp.has('debug');
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const RESERVED_PARAMS = ['lang', 'reset', 'debug'];

  // ---------------------------------------------------------------- i18n

  const UI = {
    ko: {
      otherLang: 'English',
      start: '시작하기',
      agree: '위 내용을 확인하였으며 연구 참여에 동의합니다.',
      nickLabel: '닉네임',
      nickPh: '예: 별빛고양이',
      nickHelp: '실명 대신 닉네임을 입력해 주세요. 참여자를 구분하는 용도로만 사용됩니다.',
      contact: '문의',
      mobileWarn: '휴대폰으로도 참여할 수 있습니다. 다만 화면이 큰 PC(데스크톱/노트북)에서 비교하기가 더 쉽고, 영상 데이터를 약 {mb}MB 사용하므로 가능하면 Wi‑Fi 에서 참여해 주세요.',
      tapToPlay: '▶ 눌러서 영상 재생',
      mobileBlock: '이 설문은 PC(데스크톱/노트북)에서만 참여할 수 있습니다. PC에서 같은 링크로 접속해 주세요.',
      instrTitle: '평가 방법',
      instrBest: '각 문항에서 평가 항목별로 <b>가장 좋은 결과 하나</b>를 선택해 주세요.',
      instrPair: '각 문항에서 두 결과(A, B)를 비교하여 평가 항목별로 <b>더 나은 결과</b>를 선택해 주세요.',
      instrCriteria: '평가 항목',
      instrTips: '진행 안내',
      tipAutoplay: '모든 영상은 자동으로 동시에 반복 재생됩니다.',
      tipWatch: '영상을 끝까지 한 번 시청한 뒤에 다음 문항으로 넘어갈 수 있습니다.',
      tipZoom: '영상을 클릭하면 그 영상만 크게 볼 수 있습니다. 크게 본 상태에서 위쪽 버튼으로 원본·A·B 를 바꿔 볼 수 있고, 영상을 다시 클릭하거나 Esc 를 누르면 돌아옵니다. 스타일 그림도 클릭하면 크게 보입니다.',
      tipSlow: '「0.5× 느리게」로 천천히 재생하면 깜빡임을 확인하기 쉽습니다.',
      tipPicks: '고른 항목의 번호가 해당 결과 영상 위에 표시됩니다.',
      tipOrder: '결과의 배치 순서는 문항마다 무작위로 바뀝니다.',
      tipNoAnswer: '정답은 없습니다. 본인의 판단에 따라 선택해 주세요.',
      tipResume: '중간에 창을 닫아도 같은 브라우저로 다시 접속하면 이어서 진행할 수 있습니다.',
      begin: '평가 시작',
      question: '문항',
      input: '원본 영상',
      styleRef: '스타일 참조',
      styleRefText: '목표 스타일',
      styleExamples: '이 스타일의 예시 그림 (클릭하면 크게)',
      blockPart: '{k}부 / 총 {n}부',
      blockStart: '시작하기',
      zoomHint: '클릭하면 이 영상만 크게 봅니다',
      unzoomHint: '클릭하면 원래 화면으로 돌아갑니다',
      unzoom: '✕ 작게 보기',
      inputShort: '원본',
      slow: '0.5× 느리게',
      play: '▶ 재생',
      pause: '❚❚ 정지',
      restart: '⟲ 처음부터',
      watching: '시청 중…',
      watched: '✓ 시청 완료',
      pickBest: '항목별로 가장 좋은 결과를 선택하세요.',
      pickBetter: '항목별로 더 나은 결과를 선택하세요.',
      next: '다음 →',
      needWatch: '영상을 끝까지 한 번 시청해 주세요.',
      needAnswers: '모든 항목에 답해 주세요.',
      needTime: '{sec}초 후에 진행할 수 있습니다.',
      loading: '영상 불러오는 중… ({done}/{total})',
      loadErr: '영상을 불러오지 못했습니다.',
      surveyTitle: '마지막으로 몇 가지만 여쭤볼게요',
      submit: '제출하기',
      submitting: '응답을 제출하는 중입니다…',
      submitFail: '응답 전송에 실패했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요. 계속 실패하면 아래 버튼으로 응답 파일을 내려받아 연구자에게 전달해 주세요.',
      retry: '다시 시도',
      download: '응답 파일 다운로드',
      noEndpoint: '[테스트 모드] config.js 에 endpoint 가 설정되지 않아 응답이 서버로 전송되지 않았습니다.',
      unverified: '응답은 전송되었지만 서버 확인을 받지 못했습니다. 만일을 위해 응답 파일을 내려받아 두셔도 좋습니다.',
      doneTitle: '참여해 주셔서 감사합니다!',
      doneBody: '응답이 정상적으로 제출되었습니다. 이제 창을 닫으셔도 됩니다.',
      already: '이 브라우저에서 이미 참여를 완료하셨습니다.',
      codeLabel: '완료 코드',
      goBack: '돌아가기',
      noData: '영상 목록(manifest.js)이 비어 있습니다. tools/prepare_videos.py 를 먼저 실행하세요.',
    },
    en: {
      otherLang: '한국어',
      start: 'Start',
      agree: 'I have read the information above and agree to participate.',
      nickLabel: 'Nickname',
      nickPh: 'e.g., bluecat',
      nickHelp: 'Please use a nickname rather than your real name. It is only used to tell participants apart.',
      contact: 'Contact',
      mobileWarn: 'You can take part on a phone, but comparing is easier on a larger screen (desktop or laptop). The study downloads about {mb} MB of video, so please use Wi‑Fi if possible.',
      tapToPlay: '▶ Tap to play',
      mobileBlock: 'This study can only be taken on a desktop or laptop. Please open the same link on a computer.',
      instrTitle: 'Instructions',
      instrBest: 'For each question, choose <b>the single best result</b> for each criterion.',
      instrPair: 'For each question, compare the two results (A and B) and choose <b>the better one</b> for each criterion.',
      instrCriteria: 'Criteria',
      instrTips: 'Notes',
      tipAutoplay: 'All videos play automatically, in sync, and loop.',
      tipWatch: 'You can move on once the videos have played through at least once.',
      tipZoom: 'Click a video to enlarge just that video. While enlarged, use the buttons on top to switch between the input, A and B; click the video again or press Esc to return. Style images also enlarge on click.',
      tipSlow: 'Use "0.5× slow" to slow playback down and check for flickering.',
      tipPicks: 'The numbers of the criteria you picked appear above the chosen video.',
      tipOrder: 'The order of the results is randomized for every question.',
      tipNoAnswer: 'There are no right or wrong answers. Please follow your own judgment.',
      tipResume: 'If you close the window, you can resume later from the same browser.',
      begin: 'Begin',
      question: 'Question',
      input: 'Input video',
      styleRef: 'Style reference',
      styleRefText: 'Target style',
      styleExamples: 'Example artworks in this style (click to enlarge)',
      blockPart: 'Part {k} of {n}',
      blockStart: 'Start',
      zoomHint: 'Click to enlarge this video',
      unzoomHint: 'Click to go back',
      unzoom: '✕ Back',
      inputShort: 'Input',
      slow: '0.5× slow',
      play: '▶ Play',
      pause: '❚❚ Pause',
      restart: '⟲ Restart',
      watching: 'Watching…',
      watched: '✓ Watched',
      pickBest: 'For each criterion, pick the best result.',
      pickBetter: 'For each criterion, pick the better result.',
      next: 'Next →',
      needWatch: 'Please watch the videos through at least once.',
      needAnswers: 'Please answer every criterion.',
      needTime: 'You can continue in {sec} s.',
      loading: 'Loading videos… ({done}/{total})',
      loadErr: 'Failed to load the video.',
      surveyTitle: 'A few final questions',
      submit: 'Submit',
      submitting: 'Submitting your responses…',
      submitFail: 'Failed to submit your responses. Please check your connection and try again. If it keeps failing, download the response file below and send it to the researchers.',
      retry: 'Retry',
      download: 'Download response file',
      noEndpoint: '[Test mode] No endpoint is set in config.js, so responses were not sent to a server.',
      unverified: 'Your responses were sent but the server did not confirm receipt. You may download a backup copy just in case.',
      doneTitle: 'Thank you for participating!',
      doneBody: 'Your responses have been submitted. You may now close this window.',
      already: 'You have already completed this study in this browser.',
      codeLabel: 'Completion code',
      goBack: 'Return',
      noData: 'The video list (manifest.js) is empty. Run tools/prepare_videos.py first.',
    },
  };

  let lang = qp.get('lang') || C.defaultLang || 'en';
  if (!UI[lang]) lang = 'en';
  const t = (obj) => (obj == null ? '' : typeof obj === 'string' ? obj : obj[lang] ?? obj.en ?? obj.ko ?? '');
  const s = (key, vars = {}) =>
    (UI[lang][key] ?? UI.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));

  // ---------------------------------------------------------------- utils

  function h(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : String(c));
    return e;
  }

  function randomId(bytes = 12) {
    const a = new Uint8Array(bytes);
    crypto.getRandomValues(a);
    return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  // 참가자 ID로 시드를 고정해 문항/배치 순서를 재현 가능하게 만든다
  function hashStr(str) {
    let h1 = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) h1 = Math.imul(h1 ^ str.charCodeAt(i), 0x01000193);
    return h1 >>> 0;
  }
  function mulberry32(a) {
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(rng, arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function derange(rng, arr) {
    if (arr.length < 2) return arr.slice();
    for (let i = 0; i < 100; i++) {
      const b = shuffle(rng, arr.slice());
      if (b.every((x, k) => x !== arr[k])) return b;
    }
    return arr.slice(1).concat(arr[0]);
  }

  const store = {
    key: 'userstudy:' + C.studyId,
    load() { try { return JSON.parse(localStorage.getItem(this.key)); } catch { return null; } },
    save(v) { try { localStorage.setItem(this.key, JSON.stringify(v)); } catch { /* private mode 등 */ } },
    clear() { try { localStorage.removeItem(this.key); } catch { /* ignore */ } },
  };

  function download(name, text) {
    const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: name });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // ---------------------------------------------------------------- study design

  const pairById = Object.fromEntries(((M && M.pairs) || []).map((p) => [p.id, p]));
  // 묶음(block): manifest 의 pair.block (없으면 'main'). config.blocks 순서대로 이어 붙이고, 섞기·반복 체크는 묶음 안에서만 한다.
  // 묶음마다 비교 대상(baseline)이 다를 수 있다 (예: 글 스타일 묶음 vs 그림 스타일 묶음)
  const blockIds = (() => {
    const present = [...new Set(((M && M.pairs) || []).map((p) => p.block || 'main'))];
    const order = (C.blocks || []).map((b) => b.id).filter((id) => present.includes(id));
    return [...order, ...present.filter((id) => !order.includes(id))];
  })();
  const blockCfg = (id) => (C.blocks || []).find((b) => b.id === id) || {};
  const repeatsFor = (id) => (C.repeatChecks && typeof C.repeatChecks === 'object'
    ? (C.repeatChecks[id] | 0) : (C.repeatChecks | 0));
  // 설계가 바뀌면 이전에 저장된 진행 상태를 버리기 위한 키
  const DESIGN = JSON.stringify([
    C.studyId, M && M.id, C.mode, C.pairwiseSampling, C.repeatChecks, blockIds,
    C.shuffleQuestions, C.shuffleCandidates, C.criteria.map((c) => c.id), PLAN && PLAN.id,
  ]);

  function buildQuestions(rng) {
    const ref = M.reference;
    const all = [];
    let nMain = 0, nRep = 0;
    for (const bid of blockIds) {
      const pairs = M.pairs.filter((p) => (p.block || 'main') === bid);
      const methodsOf = (p) => M.methods.filter((m) => p.results[m]);
      const main = [];
      if (BALANCED && C.mode === 'pairwise') {
        // 속도 묶음(빠름/느림)마다: 영상 쌍을 섞어 비교 방법 수만큼 이어 붙인 뒤(모자라면 다시 섞어 덧붙임) 섞은 비교 방법과 짝짓는다.
        // → 비교 방법마다 묶음당 1문항, 한 참가자 안에서 같은 묶음의 영상 쌍은 고르게(최대 1번 차이) 쓰인다
        const pb = (PLAN.blocks || []).find((x) => x.block === bid);
        if (pb) {
          for (const [speed, ids] of Object.entries(pb.groups || {})) {
            if (!ids.length) continue;
            const deck = [];
            while (deck.length < pb.baselines.length) deck.push(...shuffle(rng, ids.slice()));
            shuffle(rng, pb.baselines.slice())
              .forEach((b, i) => main.push({ pair: deck[i], candidates: [ref, b], speed }));
          }
        }
      } else if (PLAN && C.mode === 'pairwise') {
        PLAN.questions.filter((x) => x.block === bid)
          .forEach((x) => main.push({ pair: x.pair, candidates: [ref, x.baseline] }));
      } else if (C.mode === 'pairwise') {
        const baselines = M.methods.filter((m) => m !== ref && pairs.some((p) => p.results[m]));
        if (C.pairwiseSampling === 'one') {
          // 쌍마다 baseline 하나: 참가자 안에서 baseline별 문항 수가 균등하도록 순환 배정
          const order = shuffle(rng, pairs.map((p) => p.id));
          const bs = shuffle(rng, baselines.slice());
          order.forEach((pid, i) => main.push({ pair: pid, candidates: [ref, bs[i % bs.length]] }));
        } else {
          for (const p of pairs) for (const b of baselines) if (p.results[b]) main.push({ pair: p.id, candidates: [ref, b] });
        }
      } else {
        for (const p of pairs) main.push({ pair: p.id, candidates: methodsOf(p) });
      }
      if (C.shuffleCandidates && C.mode === 'pairwise') {
        // 우리 방법이 묶음 안에서 정확히 절반은 A, 절반은 B 에 오도록 (문항 수가 홀수면 남는 하나는 무작위)
        const nA = Math.floor(main.length / 2) + (main.length % 2 && rng() < 0.5 ? 1 : 0);
        const sideA = shuffle(rng, main.map((_, i) => i < nA));
        main.forEach((q, i) => { if (!sideA[i]) q.candidates.reverse(); });
      } else if (C.shuffleCandidates) {
        main.forEach((q) => shuffle(rng, q.candidates));
      }
      if (C.shuffleQuestions) {
        // 같은 영상 쌍(비교 방법만 다른 문항)이 연달아 나오지 않게 섞는다
        for (let tries = 0; tries < 500; tries++) {
          shuffle(rng, main);
          if (main.every((q, i) => i === 0 || q.pair !== main[i - 1].pair)) break;
        }
      }
      main.forEach((q) => { q.qid = 'q' + String(++nMain).padStart(2, '0'); q.kind = 'main'; q.block = bid; });

      // 일관성 체크: 앞쪽 절반에서 고른 문항을 배치만 바꿔 뒤쪽 절반에 다시 넣는다 (원 문항과 최소 3문항 간격, 같은 묶음 안)
      const half = Math.ceil(main.length / 2);
      const n = Math.max(0, Math.min(repeatsFor(bid), half));
      const blk = main.slice();
      shuffle(rng, [...Array(half).keys()]).slice(0, n).forEach((oi) => {
        const src = main[oi];
        const rep = {
          qid: 'r' + String(++nRep).padStart(2, '0'), kind: 'repeat', repeatOf: src.qid, block: bid,
          pair: src.pair, candidates: derange(rng, src.candidates), speed: src.speed,
        };
        const lo = Math.min(Math.max(half, oi + 3), blk.length);
        blk.splice(lo + Math.floor(rng() * (blk.length - lo + 1)), 0, rep);
      });
      if (blk.length) blk[0].blockStart = true;
      all.push(...blk);
    }
    return all;
  }

  function newState() {
    const pid = randomId();
    const params = {};
    for (const [k, v] of qp) if (!RESERVED_PARAMS.includes(k)) params[k] = v;
    return {
      design: DESIGN,
      participantId: pid,
      phase: 'intro',
      lang,
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      params,
      questions: buildQuestions(mulberry32(hashStr(pid))),
      answers: [],
      survey: {},
      submitted: false,
      testMode: false,
      unverified: false,
      completionCode: C.completionCode || pid.slice(0, 8).toUpperCase(),
    };
  }

  function consistency(st) {
    const byQid = Object.fromEntries(st.answers.map((a) => [a.qid, a]));
    let agree = 0, total = 0, repeats = 0;
    for (const a of st.answers) {
      if (a.kind !== 'repeat' || !byQid[a.repeatOf]) continue;
      repeats++;
      for (const c of C.criteria) {
        total++;
        if (a.choices[c.id] === byQid[a.repeatOf].choices[c.id]) agree++;
      }
    }
    return { repeats, agree, total, rate: total ? +(agree / total).toFixed(4) : null };
  }

  function buildPayload(st) {
    return {
      studyId: C.studyId,
      manifestId: M.id,
      dummy: !!M.dummy,
      participantId: st.participantId,
      nickname: st.nickname || '',
      mode: C.mode,
      pairwiseSampling: C.mode === 'pairwise' ? (BALANCED ? 'balanced' : PLAN ? 'fixed' : C.pairwiseSampling) : undefined,
      planId: PLAN ? PLAN.id : null,
      lang: st.lang,
      startedAt: st.startedAt,
      finishedAt: st.finishedAt,
      durationSec: Math.round((Date.parse(st.finishedAt) - Date.parse(st.startedAt)) / 1000),
      criteria: C.criteria.map((c) => c.id),
      methods: M.methods,
      reference: M.reference,
      blocks: blockIds,
      params: st.params,
      survey: st.survey,
      client: {
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        viewport: `${innerWidth}x${innerHeight}`,
        dpr: devicePixelRatio,
        tz: (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone,
      },
      checks: consistency(st),
      answers: st.answers,
    };
  }

  // ---------------------------------------------------------------- video loading

  // 영상을 통째로 받아 blob URL 로 재생한다: 반복/동기화 시 끊김이 없고 다음 문항을 미리 받아둘 수 있다
  const blobs = new Map();
  // 아이폰·아이패드(iOS 사파리)는 메모리에 받은 영상(blob)을 재생하지 못하는 경우가 있어 원래 주소로 직접 재생한다.
  // iPadOS 는 맥처럼 보이므로 터치 지원 여부로 구분한다
  const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function fetchBlob(u) {
    if (IOS) return Promise.resolve(u);
    let e = blobs.get(u);
    if (!e) {
      e = { obj: null };
      e.p = fetch(u)
        .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); })
        .then((b) => (e.obj = URL.createObjectURL(b)))
        .catch(() => u); // file:// 등 fetch 불가 환경이면 원래 URL 로 직접 재생
      blobs.set(u, e);
    }
    return e.p;
  }
  function keepBlobs(keep) {
    for (const [u, e] of blobs) {
      if (keep.has(u)) continue;
      if (e.obj) URL.revokeObjectURL(e.obj);
      blobs.delete(u);
    }
  }
  function videoUrls(q) {
    if (!q) return [];
    const p = pairById[q.pair];
    return [...(C.showContent && p.content ? [p.content] : []), ...q.candidates.map((c) => p.results[c])];
  }
  function prefetch(q) {
    if (!q) return;
    if (!IOS) videoUrls(q).forEach(fetchBlob);
    const p = pairById[q.pair];
    if (C.showStyle && p.style) new Image().src = p.style;
    if (C.showStyle && p.styleImages) p.styleImages.forEach((u) => { new Image().src = u; });
  }

  function makeVideo() {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.disablePictureInPicture = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.addEventListener('contextmenu', (e) => e.preventDefault());
    return v;
  }

  // 메타데이터(길이·크기)까지만 받으면 재생을 시작할 수 있다고 본다.
  // 아이폰 사파리는 재생을 시작하기 전에는 영상 데이터를 미리 받지 않아서, 첫 프레임(loadeddata)을 기다리면 끝나지 않는다
  function loadVideo(v, src, timeoutMs = 20000) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (ok, why) => { if (!done) { done = true; clearTimeout(tm); resolve({ ok, why }); } };
      v.addEventListener('loadedmetadata', () => finish(true), { once: true });
      v.addEventListener('error', () => finish(false, 'error ' + (v.error ? v.error.code : '')), { once: true });
      const tm = setTimeout(() => finish(v.readyState >= 1, 'timeout'), timeoutMs);
      v.src = src;
    });
  }

  // 가장 긴 영상을 기준(master)으로 나머지를 주기적으로 맞추고, master 가 끝나면 전부 처음으로 돌린다
  class SyncGroup {
    constructor(videos, onLoop) {
      this.videos = videos;
      this.onLoop = onLoop;
      this.loops = 0;
      this.playing = false;
      this.rate = 1;
      this.master = videos.reduce((a, b) => ((b.duration || 0) > (a.duration || 0) ? b : a), videos[0]);
      this._ended = () => {
        this.loops++;
        this.onLoop(this.loops);
        this.seek(0);
        if (this.playing) this.play();
      };
      this.master.addEventListener('ended', this._ended);
      this._timer = setInterval(() => this._sync(), 200);
    }
    _sync() {
      const m = this.master;
      if (!this.playing || m.paused || m.seeking) return;
      for (const v of this.videos) {
        if (v === m || v.seeking) continue;
        const target = Math.min(m.currentTime, (v.duration || Infinity) - 0.02);
        if (Math.abs(v.currentTime - target) > 0.1) v.currentTime = target;
        if (v.paused && m.currentTime < (v.duration || 0) - 0.05) v.play().catch(() => {});
      }
    }
    play() {
      this.playing = true;
      return Promise.all(this.videos.map((v) => { v.playbackRate = this.rate; return v.play().catch((e) => e); }))
        .then((rs) => {
          // 자동재생이 막힌 브라우저면 정지 상태로 두고 사용자가 재생 버튼을 누르게 한다
          if (rs.some((r) => r && r.name === 'NotAllowedError')) { this.pause(); return false; }
          return true;
        });
    }
    pause() {
      this.playing = false;
      this.videos.forEach((v) => v.pause());
      const tm = this.master.currentTime;
      this.videos.forEach((v) => { if (v !== this.master) v.currentTime = Math.min(tm, v.duration || tm); });
    }
    seek(tm) { this.videos.forEach((v) => { v.currentTime = tm; }); }
    restart() { this.seek(0); if (this.playing) this.play(); }
    setRate(r) { this.rate = r; this.videos.forEach((v) => { v.playbackRate = r; }); }
    // 크게 보기용 복제 영상을 잠시 묶음에 넣고 뺀다 (src 를 바꾼 뒤 다시 add 하면 새 영상도 현재 위치에 맞춘다)
    add(v) {
      if (!this.videos.includes(v)) this.videos.push(v);
      const align = () => {
        v.playbackRate = this.rate;
        v.currentTime = this.master.currentTime;
        if (this.playing) v.play().catch(() => {}); else v.pause();
      };
      if (v.readyState >= 1) align(); else v.addEventListener('loadedmetadata', align, { once: true });
    }
    remove(v) { this.videos = this.videos.filter((x) => x !== v); v.pause(); }
    destroy() {
      clearInterval(this._timer);
      this.master.removeEventListener('ended', this._ended);
      this.videos.forEach((v) => { v.pause(); v.removeAttribute('src'); v.load(); });
    }
  }

  // ---------------------------------------------------------------- screens

  const topTitle = document.getElementById('study-title');
  const progress = document.getElementById('progress');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const langBtn = document.getElementById('lang-toggle');

  let st = null;
  let cleanup = [];
  let justSubmitted = false;
  const save = () => store.save(st);
  const smallScreen = Math.min(screen.width, screen.height) < 700 && matchMedia('(pointer: coarse)').matches;

  function setChrome() {
    document.documentElement.lang = lang;
    document.title = t(C.title);
    topTitle.textContent = t(C.title);
    langBtn.textContent = UI[lang].otherLang;
    langBtn.hidden = st && st.phase === 'study';
    const inStudy = st && st.phase === 'study';
    progress.hidden = !inStudy;
    if (inStudy) {
      const n = st.questions.length, i = st.answers.length;
      progressBar.style.setProperty('--p', (100 * i) / n + '%');
      progressText.replaceChildren(`${s('question')} `, h('b', {}, Math.min(i + 1, n)), ` / ${n}`);
    }
  }

  function render() {
    cleanup.forEach((f) => f());
    cleanup = [];
    setChrome();
    window.scrollTo(0, 0);
    ({ intro: renderIntro, instructions: renderInstructions, study: renderQuestion,
      survey: renderSurvey, submit: renderSubmit, done: renderDone })[st.phase]();
  }

  function go(phase) {
    st.phase = phase;
    save();
    render();
  }

  function renderIntro() {
    if (C.blockMobile && smallScreen) {
      app.replaceChildren(h('div', { class: 'sheet' }, h('h1', {}, t(C.title)), h('p', {}, s('mobileBlock'))));
      return;
    }
    const agree = h('input', { type: 'checkbox' });
    const nick = C.askNickname
      ? h('input', { type: 'text', id: 'nickname', maxlength: 30, autocomplete: 'off', placeholder: s('nickPh') })
      : null;
    if (nick) nick.value = st.nickname || '';
    const start = h('button', {
      class: 'btn primary', disabled: true,
      onclick: () => { if (nick) st.nickname = nick.value.trim(); go('instructions'); },
    }, s('start'));
    const update = () => { start.disabled = !agree.checked || !!(nick && !nick.value.trim()); };
    agree.addEventListener('change', update);
    if (nick) {
      nick.addEventListener('input', () => { st.nickname = nick.value; update(); });
      nick.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !start.disabled) start.click(); });
    }
    app.replaceChildren(h('div', { class: 'sheet' },
      h('h1', {}, t(C.title)),
      h('div', { html: t(C.intro).replaceAll('{minutes}', C.estimatedMinutes).replaceAll('{questions}', st.questions.length) }),
      smallScreen && h('div', { class: 'notice' }, s('mobileWarn', { mb: C.approxDownloadMB || 200 })),
      C.contact && h('p', { class: 'muted' }, `${s('contact')}: ${C.contact}`),
      nick && h('div', { class: 'field' },
        h('label', { for: 'nickname' }, s('nickLabel'), h('span', { class: 'req' }, '*')),
        nick,
        h('div', { class: 'help' }, s('nickHelp'))),
      h('label', { class: 'check' }, agree, h('span', {}, s('agree'))),
      h('div', { class: 'actions' }, start),
    ));
  }

  function renderInstructions() {
    const tips = ['tipAutoplay', C.requireFullPlay && 'tipWatch', 'tipPicks', 'tipZoom', 'tipSlow', 'tipOrder', 'tipNoAnswer', 'tipResume']
      .filter(Boolean);
    app.replaceChildren(h('div', { class: 'sheet' },
      h('h1', {}, s('instrTitle')),
      h('p', { html: s(C.mode === 'pairwise' ? 'instrPair' : 'instrBest') }),
      C.instructionsNote && h('div', { html: t(C.instructionsNote) }),
      h('h2', {}, s('instrCriteria')),
      h('dl', { class: 'crit-list' }, C.criteria.map((c, i) =>
        h('div', {}, h('span', { class: 'num' }, i + 1), h('dt', {}, t(c.label)), h('dd', {}, t(c.desc))))),
      h('h2', {}, s('instrTips')),
      h('ul', {}, tips.map((k) => h('li', {}, s(k)))),
      h('div', { class: 'actions' }, h('button', {
        class: 'btn primary',
        onclick: () => { st.startedAt = st.startedAt || new Date().toISOString(); go('study'); },
      }, s('begin'))),
    ));
  }

  // 묶음이 여럿이면 각 묶음의 첫 문항 앞에 그 묶음 안내 화면을 한 번 보여준다
  function renderBlockIntro(bid) {
    const cfg = blockCfg(bid);
    const k = blockIds.indexOf(bid) + 1;
    app.replaceChildren(h('div', { class: 'sheet' },
      h('div', { class: 'eyebrow' }, s('blockPart', { k, n: blockIds.length })),
      h('h1', {}, t(cfg.title) || bid),
      cfg.intro && h('div', { html: t(cfg.intro).replaceAll('{n}', st.questions.filter((x) => x.block === bid).length) }),
      h('div', { class: 'actions' }, h('button', {
        class: 'btn primary',
        onclick: () => { st.blockSeen = { ...(st.blockSeen || {}), [bid]: true }; save(); render(); },
      }, s('blockStart'))),
    ));
  }

  function openLightbox(u) {
    const close = () => { ov.remove(); document.removeEventListener('keydown', onEsc); };
    const onEsc = (e) => { if (e.key === 'Escape') close(); };
    const ov = h('div', { class: 'lightbox', onclick: close }, h('img', { src: u, alt: '' }));
    document.addEventListener('keydown', onEsc);
    document.body.append(ov);
    cleanup.push(close);
  }

  async function renderQuestion() {
    const idx = st.answers.length;
    const q = st.questions[idx];
    if (!q) { go(C.survey && C.survey.length ? 'survey' : 'submit'); return; }
    if (q.blockStart && blockIds.length > 1 && !(st.blockSeen || {})[q.block]) { renderBlockIntro(q.block); return; }
    const pair = pairById[q.pair];
    const n = q.candidates.length;
    const aspect = pair.width && pair.height ? pair.width / pair.height : 16 / 9;

    let alive = true;
    let group = null;
    let ready = false;
    let t0 = performance.now();
    let zooms = 0;
    const choices = {};
    const loadErrors = [];

    // --- 참조: 원본 영상 + 목표 스타일 (그림 한 장, 또는 설명 글 + 예시 그림)
    const contentVideo = C.showContent && pair.content ? makeVideo() : null;
    const hasStyleImg = C.showStyle && pair.style;
    const hasStyleText = C.showStyle && !hasStyleImg && pair.styleText;
    const examples = hasStyleText ? pair.styleImages || [] : [];
    const refbar = h('div', { class: 'refbar' },
      contentVideo && h('div', { class: 'ref ref-video' },
        h('div', { class: 'cap' }, s('input')), h('div', { class: 'media', title: s('zoomHint') }, contentVideo)),
      hasStyleImg && h('div', { class: 'ref ref-image' },
        h('div', { class: 'cap' }, s('styleRef')),
        h('div', { class: 'media' }, h('img', { src: pair.style, alt: s('styleRef'), onclick: () => openLightbox(pair.style) }))),
      hasStyleText && h('div', { class: 'ref ref-style' },
        h('div', { class: 'cap' }, s('styleRefText')),
        h('div', { class: 'stext' }, t(pair.styleText)),
        examples.length ? [
          h('div', { class: 'sub' }, s('styleExamples')),
          h('div', { class: 'sthumbs' }, examples.map((u) => h('img', { src: u, alt: '', onclick: () => openLightbox(u) }))),
        ] : null),
    );

    // --- 결과 영상 A, B, …
    const loadText = h('span', {}, s('loading', { done: 0, total: videoUrls(q).length }));
    const overlay = h('div', { class: 'overlay' }, h('div', { class: 'spinner' }), loadText);
    const results = h('div', { class: 'results' }, overlay);
    const cards = q.candidates.map((code, k) => {
      const v = makeVideo();
      const picks = h('span', { class: 'picks' });
      const card = h('div', { class: 'card' },
        h('div', { class: 'card-head' }, h('span', { class: 'badge' }, LETTERS[k], DEBUG && h('small', {}, code)), picks),
        h('div', { class: 'media', title: s('zoomHint') }, v));
      return { code, card, picks, video: v, url: pair.results[code] };
    });
    results.append(...cards.map((c) => c.card));

    // --- 재생 막대 (모든 영상을 함께 제어)
    const playBtn = h('button', { class: 'pbtn', type: 'button' }, s('pause'));
    const restartBtn = h('button', { class: 'pbtn', type: 'button' }, s('restart'));
    const rateBtn = h('button', { class: 'pbtn', type: 'button' }, s('slow'));
    const trackFill = h('i');
    const status = h('span', { class: 'status' }, s('watching'));
    const playbar = h('div', { class: 'playbar' },
      playBtn, restartBtn, rateBtn, h('div', { class: 'track' }, trackFill), status);

    // --- 영상 하나만 크게: 클릭한 영상과 같은 데이터를 쓰는 복제 영상을 비교 영역에 크게 띄우고 동기화 묶음에 잠시 넣는다.
    //     재생 막대와 질문 패널은 그대로 쓸 수 있고, 위쪽 버튼으로 원본·A·B 를 바꿔 볼 수 있다
    const zoomables = [
      ...(contentVideo ? [{ label: s('inputShort'), video: contentVideo }] : []),
      ...cards.map((c, k) => ({ label: LETTERS[k], video: c.video })),
    ];
    const zoomVideo = makeVideo();
    const zoomTabs = h('div', { class: 'zoom-tabs' });
    const zoomView = h('div', { class: 'zoomview', hidden: true },
      h('div', { class: 'zoom-head' }, zoomTabs,
        h('button', { class: 'pbtn', type: 'button', onclick: () => closeZoom() }, s('unzoom'))),
      h('div', { class: 'media', title: s('unzoomHint') }, zoomVideo));
    let zoomed = null;
    let zoomFrom = null;
    const narrow = () => innerWidth <= 1000;
    const openZoom = (i) => {
      const v = zoomables[i].video;
      if (!group || !group.videos.includes(v)) return; // 아직 로딩 중이거나 불러오지 못한 영상
      if (zoomed == null) { zooms++; zoomFrom = v.closest('.card, .ref'); }
      zoomed = i;
      zoomTabs.replaceChildren(...zoomables.map((z, j) => h('button', {
        class: j === i ? 'ztab on' : 'ztab', type: 'button', onclick: () => openZoom(j),
      }, z.label)));
      if (zoomVideo.src !== v.currentSrc) zoomVideo.src = v.currentSrc;
      group.add(zoomVideo);
      main.classList.add('zooming');
      zoomView.hidden = false;
      if (narrow()) zoomView.scrollIntoView({ block: 'start' });
    };
    const closeZoom = () => {
      if (zoomed == null) return;
      zoomed = null;
      zoomView.hidden = true;
      main.classList.remove('zooming');
      if (group) group.remove(zoomVideo);
      layout();
      // 휴대폰처럼 화면을 내려 보던 중이면 누른 영상 자리로 돌아간다
      if (narrow() && zoomFrom) zoomFrom.scrollIntoView({ block: 'center' });
    };
    zoomables.forEach((z, i) => z.video.addEventListener('click', () => openZoom(i)));
    zoomVideo.addEventListener('click', closeZoom);

    const main = h('div', { class: 'main', style: `--ar:${aspect}` }, refbar, results, zoomView, playbar);

    // --- 질문 패널
    const count = h('span', { class: 'count' });
    const updatePicks = () => {
      cards.forEach((cd, k) => cd.picks.replaceChildren(...C.criteria.map((c, ci) =>
        (choices[c.id] === k ? h('span', { class: 'num', title: t(c.label) }, ci + 1) : null)).filter(Boolean)));
      count.textContent = `${C.criteria.filter((c) => choices[c.id] != null).length} / ${C.criteria.length}`;
    };
    const critEls = C.criteria.map((c, ci) => {
      const btns = q.candidates.map((_, k) => {
        const b = h('button', { class: 'choice', type: 'button' }, LETTERS[k]);
        b.addEventListener('click', () => {
          choices[c.id] = k;
          btns.forEach((x, j) => x.classList.toggle('on', j === k));
          el.classList.add('done');
          updatePicks();
          validate();
        });
        b.addEventListener('mouseenter', () => cards[k].card.classList.add('hl'));
        b.addEventListener('mouseleave', () => cards[k].card.classList.remove('hl'));
        return b;
      });
      const el = h('div', { class: 'crit' },
        h('div', { class: 'crit-top' }, h('span', { class: 'num' }, ci + 1), h('span', { class: 'lbl' }, t(c.label))),
        h('div', { class: 'desc' }, t((c.descByBlock && c.descByBlock[q.block]) || c.desc)),
        h('div', { class: 'choices', style: `--n:${n}` }, btns));
      return el;
    });
    updatePicks();

    const nextBtn = h('button', { class: 'btn primary', type: 'button', disabled: true }, s('next'));
    const hint = h('div', { class: 'hint' });
    const panel = h('div', { class: 'panel' },
      h('div', { class: 'panel-head' },
        blockIds.length > 1 && h('div', { class: 'block-tag' },
          `${s('blockPart', { k: blockIds.indexOf(q.block) + 1, n: blockIds.length })} · ${t(blockCfg(q.block).title) || q.block}`),
        h('div', { class: 'panel-title' }, s(C.mode === 'pairwise' ? 'pickBetter' : 'pickBest'), count),
        DEBUG && h('div', { class: 'debug' }, `[debug] ${q.qid} ${q.kind}${q.repeatOf ? ' of ' + q.repeatOf : ''} · pair ${q.pair} · block ${q.block}`)),
      h('div', { class: 'crits' }, critEls),
      h('div', { class: 'next-wrap' }, nextBtn, hint));

    app.replaceChildren(h('div', { class: 'study' }, main, panel));

    // 화면 크기에 맞춰 결과 영상을 가능한 한 크게, 남는 높이는 참조(원본·스타일) 줄에 준다
    const GAP = 12, HEAD = 36, BORDER = 4, REF_MIN = 150, REF_MAX = 320;
    const layout = () => {
      if (main.classList.contains('zooming')) return; // 크게 보기 중에는 참조·결과가 숨겨져 있어 크기를 잴 수 없다
      const styleCard = refbar.querySelector('.ref-image');
      if (innerWidth <= 1000) {
        ['--media-w', '--media-h', '--col-w', '--ref-h', '--ref-video-w'].forEach((k) => main.style.removeProperty(k));
        if (styleCard) styleCard.style.width = '';
        results.style.setProperty('--cols', Math.min(n, 2));
        return;
      }
      const cs = getComputedStyle(main);
      const innerW = main.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const innerH = main.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const avail = innerH - playbar.offsetHeight - 2 * GAP; // 참조 줄 + 결과 영상이 나눠 쓸 높이
      let best = { w: 0, c: Math.min(n, 2) };
      for (let c = Math.min(n, 2); c <= n; c++) {
        const r = Math.ceil(n / c);
        const maxW = (innerW - (c - 1) * GAP) / c - BORDER;
        const maxH = (avail - REF_MIN - GAP - r * (HEAD + BORDER) - (r - 1) * GAP) / r;
        const w = Math.min(maxW, maxH * aspect);
        if (w > best.w + 1) best = { w, c };
      }
      const rows = Math.ceil(n / best.c);
      const mw = Math.max(80, Math.floor(best.w)), mh = Math.floor(mw / aspect);
      const refH = Math.round(Math.max(REF_MIN, Math.min(REF_MAX, avail - GAP - rows * (mh + HEAD + BORDER) - (rows - 1) * GAP)));
      const cap = refbar.querySelector('.cap');
      const refMediaH = refH - (cap ? cap.offsetHeight : 32) - 2;
      main.style.setProperty('--media-w', mw + 'px');
      main.style.setProperty('--media-h', mh + 'px');
      main.style.setProperty('--col-w', mw + BORDER + 'px');
      main.style.setProperty('--ref-h', refH + 'px');
      main.style.setProperty('--ref-video-w', Math.round(refMediaH * aspect) + 2 + 'px');
      const im = styleCard && styleCard.querySelector('img');
      if (im && im.naturalWidth) {
        styleCard.style.width = Math.round(Math.min(innerW * 0.5, refMediaH * im.naturalWidth / im.naturalHeight)) + 2 + 'px';
      }
      results.style.setProperty('--cols', best.c);
    };
    layout();
    refbar.querySelectorAll('img').forEach((im) => im.addEventListener('load', layout));
    const onEsc = (e) => { if (e.key === 'Escape') closeZoom(); };
    addEventListener('resize', layout);
    document.addEventListener('keydown', onEsc);
    cleanup.push(() => { removeEventListener('resize', layout); document.removeEventListener('keydown', onEsc); });

    function validate() {
      const answered = C.criteria.every((c) => choices[c.id] != null);
      const watched = !C.requireFullPlay || !group || group.loops >= 1;
      const elapsed = (performance.now() - t0) / 1000;
      const minSec = C.minSecondsPerQuestion || 0;
      nextBtn.disabled = !(ready && answered && watched && elapsed >= minSec);
      hint.textContent = !ready ? ''
        : !watched ? s('needWatch')
        : !answered ? s('needAnswers')
        : elapsed < minSec ? s('needTime', { sec: Math.ceil(minSec - elapsed) })
        : '';
    }
    const vt = setInterval(validate, 500);
    const pt = setInterval(() => {
      const m = group && group.master;
      if (m && m.duration) trackFill.style.width = (100 * m.currentTime) / m.duration + '%';
    }, 100);
    cleanup.push(() => { alive = false; clearInterval(vt); clearInterval(pt); if (group) group.destroy(); });

    nextBtn.addEventListener('click', () => {
      if (nextBtn.disabled) return;
      nextBtn.disabled = true;
      st.answers.push({
        qid: q.qid,
        kind: q.kind,
        repeatOf: q.repeatOf || null,
        pair: q.pair,
        block: q.block || 'main',
        speed: q.speed || null,
        candidates: q.candidates,
        choices: Object.fromEntries(C.criteria.map((c) => [c.id, q.candidates[choices[c.id]]])),
        positions: Object.fromEntries(C.criteria.map((c) => [c.id, LETTERS[choices[c.id]]])),
        timeMs: Math.round(performance.now() - t0),
        loops: group ? group.loops : 0,
        zooms,
        loadErrors,
      });
      save();
      render();
    });

    // --- load videos (blob), then start synced playback
    const vids = [...(contentVideo ? [{ video: contentVideo, url: pair.content }] : []), ...cards];
    let loaded = 0;
    const oks = await Promise.all(vids.map(async (x) => {
      const src = await fetchBlob(x.url);
      if (!alive) return false;
      let res = await loadVideo(x.video, src);
      // 메모리에 받은 영상(blob)으로 안 되면 원래 주소로 한 번 더
      if (!res.ok && src !== x.url && alive) res = await loadVideo(x.video, x.url);
      loadText.textContent = s('loading', { done: ++loaded, total: vids.length });
      if (!res.ok) {
        loadErrors.push(`${x.code || 'content'}:${res.why}`);
        x.video.replaceWith(h('div', { class: 'err' }, s('loadErr'), h('br'), h('small', {}, `(${res.why})`)));
      }
      return res.ok;
    }));
    if (!alive) return;

    const good = vids.filter((_, i) => oks[i]).map((x) => x.video);
    overlay.remove();
    ready = true;
    t0 = performance.now();
    const setPlayLabel = () => { playBtn.textContent = s(group && group.playing ? 'pause' : 'play'); };
    // 자동재생이 막힌 환경(예: 아이폰 저전력 모드)에서는 결과 영상 위에 크게 '눌러서 재생' 버튼을 띄운다
    let tapPlay = null;
    const playFromTap = () => group.play().then((ok) => {
      if (ok !== false && tapPlay) { tapPlay.remove(); tapPlay = null; }
      setPlayLabel();
    });
    if (good.length) {
      group = new SyncGroup(good, () => {
        status.textContent = s('watched');
        status.classList.add('ok');
        validate();
      });
      const started = await group.play();
      if (started === false) {
        tapPlay = h('button', { class: 'tap-play', type: 'button', onclick: playFromTap }, s('tapToPlay'));
        results.append(tapPlay);
      }
      setPlayLabel();
    }
    playBtn.addEventListener('click', () => {
      if (!group) return;
      if (group.playing) group.pause(); else playFromTap();
      setPlayLabel();
    });
    restartBtn.addEventListener('click', () => group && group.restart());
    rateBtn.addEventListener('click', () => {
      if (!group) return;
      group.setRate(group.rate === 1 ? 0.5 : 1);
      rateBtn.classList.toggle('on', group.rate !== 1);
    });
    const onKey = (e) => {
      if (e.code !== 'Space' || /INPUT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) return;
      e.preventDefault();
      playBtn.click();
    };
    document.addEventListener('keydown', onKey);
    cleanup.push(() => document.removeEventListener('keydown', onKey));
    validate();

    // 현재·다음 문항 영상만 메모리에 유지하고 다음 문항을 미리 받는다
    const next = st.questions[idx + 1];
    keepBlobs(new Set([...videoUrls(q), ...videoUrls(next)]));
    prefetch(next);
  }

  function renderSurvey() {
    const vals = { ...st.survey };
    const submitBtn = h('button', { class: 'btn primary', type: 'button' }, s('submit'));
    const check = () => {
      submitBtn.disabled = !C.survey.every((f) => !f.required || (vals[f.id] != null && String(vals[f.id]).trim() !== ''));
    };
    const fields = C.survey.map((f) => {
      const label = [t(f.label), f.required && h('span', { class: 'req' }, '*')];
      if (f.type === 'choice') {
        return h('div', { class: 'field' }, h('div', { class: 'q' }, label), f.options.map((o) => {
          const r = h('input', { type: 'radio', name: f.id, value: o.value, checked: vals[f.id] === o.value });
          r.addEventListener('change', () => { vals[f.id] = o.value; check(); });
          return h('label', { class: 'opt' }, r, t(o.label));
        }));
      }
      const ta = h('textarea', { maxlength: 2000 });
      ta.value = vals[f.id] || '';
      ta.addEventListener('input', () => { vals[f.id] = ta.value; check(); });
      return h('div', { class: 'field' }, h('label', {}, label), ta);
    });
    submitBtn.addEventListener('click', () => {
      st.survey = vals;
      go('submit');
    });
    check();
    app.replaceChildren(h('div', { class: 'sheet' },
      h('h1', {}, s('surveyTitle')), fields, h('div', { class: 'actions' }, submitBtn)));
  }

  async function send(payload) {
    if (!C.endpoint) return { ok: false, noEndpoint: true };
    const body = JSON.stringify(payload);
    try {
      // text/plain 이면 CORS preflight 없이 Apps Script 로 보낼 수 있다
      const r = await fetch(C.endpoint, { method: 'POST', body, headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
      const j = await r.json().catch(() => null);
      if (j && j.ok) return { ok: true };
      return { ok: false, error: (j && j.error) || 'HTTP ' + r.status };
    } catch (err) {
      // 응답을 읽지 못한 경우(CORS 등): no-cors 로 재전송. 도착 확인은 불가하므로 unverified 로 표시 (중복은 분석 시 제거)
      try {
        await fetch(C.endpoint, { method: 'POST', body, mode: 'no-cors' });
        return { ok: true, unverified: true };
      } catch (err2) {
        return { ok: false, error: String(err2) };
      }
    }
  }

  async function renderSubmit() {
    st.finishedAt = st.finishedAt || new Date().toISOString();
    save();
    const payload = buildPayload(st);
    app.replaceChildren(h('div', { class: 'sheet center' },
      h('div', { class: 'actions', style: 'justify-content:center' }, h('div', { class: 'spinner' }), s('submitting'))));
    const res = await send(payload);
    if (res.ok || res.noEndpoint) {
      st.submitted = true;
      st.testMode = !!res.noEndpoint;
      st.unverified = !!res.unverified;
      justSubmitted = true;
      go('done');
      return;
    }
    console.error('submit failed', res.error);
    app.replaceChildren(h('div', { class: 'sheet' },
      h('div', { class: 'notice error' }, s('submitFail')),
      h('p', { class: 'muted' }, String(res.error || '')),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', onclick: () => download(`userstudy_${st.participantId}.json`, JSON.stringify(payload, null, 2)) }, s('download')),
        h('button', { class: 'btn primary', onclick: () => render() }, s('retry'))),
    ));
  }

  function renderDone() {
    const backup = () => download(`userstudy_${st.participantId}.json`, JSON.stringify(buildPayload(st), null, 2));
    const showBackup = st.testMode || st.unverified;
    app.replaceChildren(h('div', { class: 'sheet center' },
      h('h1', {}, s('doneTitle')),
      h('p', {}, justSubmitted ? s('doneBody') : s('already')),
      // 완료 코드는 config.completionCode 를 넣었을 때만 보여준다 (사례 지급·외부 플랫폼용)
      C.completionCode && h('div', { class: 'muted' }, s('codeLabel')),
      C.completionCode && h('div', { class: 'code' }, C.completionCode),
      st.testMode && h('div', { class: 'notice' }, s('noEndpoint')),
      st.unverified && h('div', { class: 'notice' }, s('unverified')),
      h('div', { class: 'actions', style: 'justify-content:center' },
        showBackup && h('button', { class: 'btn', onclick: backup }, s('download')),
        C.completionUrl && h('a', { class: 'btn primary', href: C.completionUrl }, s('goBack'))),
    ));
    if (C.completionUrl && justSubmitted && !st.testMode) setTimeout(() => { location.href = C.completionUrl; }, 4000);
  }

  // ---------------------------------------------------------------- boot

  if (!M || !Array.isArray(M.pairs) || !M.pairs.length) {
    app.replaceChildren(h('div', { class: 'sheet' }, h('div', { class: 'notice error' }, s('noData'))));
    return;
  }
  if (M.dummy) {
    document.getElementById('dummy-banner').hidden = false;
    document.body.classList.add('has-banner');
  }
  if (qp.has('reset')) {
    store.clear();
    qp.delete('reset');
    history.replaceState(null, '', pageUrl);
  }

  // ?preview=N : N번째 문항을 바로 보여준다 / ?preview=intro-<묶음id> : 그 묶음 안내 화면 (화면 확인용, 진행 상태를 저장하지 않음)
  if (qp.has('preview')) {
    st = newState();
    const pv = qp.get('preview');
    st.phase = 'study';
    if (pv.startsWith('intro-')) {
      st.questions = st.questions.filter((q) => q.block === pv.slice(6)).slice(0, 1);
    } else {
      st.questions = st.questions.slice(Math.max(0, (parseInt(pv, 10) || 1) - 1)).slice(0, 1);
      st.blockSeen = Object.fromEntries(blockIds.map((b) => [b, true]));
    }
    store.save = () => {};
    setChrome();
    render();
    return;
  }

  st = store.load();
  if (!st || st.design !== DESIGN) st = newState();
  if (!qp.has('lang') && st.lang && UI[st.lang]) lang = st.lang;
  st.lang = lang;
  save();

  langBtn.addEventListener('click', () => {
    lang = lang === 'ko' ? 'en' : 'ko';
    st.lang = lang;
    save();
    render();
  });
  window.addEventListener('beforeunload', (e) => {
    if (st.phase === 'study') { e.preventDefault(); e.returnValue = ''; }
  });

  render();
})();
