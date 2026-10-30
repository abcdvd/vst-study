// 유저 스터디 설정. 영상 목록(manifest.js)은 tools/prepare_videos.py 가 자동 생성하므로 여기서는 건드리지 않는다.
// 2026-10-30 v2: A/B(우리 방법 vs 비교 방법 하나) × 2부 (1부 글 스타일 12문항 + 반복 1, 2부 그림 스타일 4문항) = 17문항
// 2026-10-30 v3: 평가 항목에 '내용 일치도'(원본 영상과 내용이 맞는지) 추가 → 4개, 약 9분. 화면 배치 개편
// 2026-10-30 v4: 고정 문항 23개 (docs/plan.js, tools/study_plan.json 의 questions). 반복 확인 문항 없음, 약 12분
// 2026-10-30 v5: 1부 비교 방법 2개 추가 (7개) → 1부 21 + 2부 8 = 29문항, 약 15분
window.STUDY_CONFIG = {
  // 응답 데이터에 함께 기록되는 ID. 설계를 바꾸면(문항/모드 변경 등) 값을 올려서 이전 응답과 구분한다.
  studyId: "vst-userstudy-v5",

  // Google Apps Script 웹 앱 URL (backend/apps_script.gs 배포 후 붙여넣기). 비어 있으면 전송하지 않고 JSON 다운로드만 제공.
  endpoint: "https://script.google.com/macros/s/AKfycbwlrJV8TdppGLJs7WlbOxJ9TGqH45y-caC62raTnMQl_bIR0UG_ZLAsuOu-Mb6p3hmR/exec",

  defaultLang: "ko", // "ko" | "en" — 링크에 ?lang=en 을 붙이면 영어로 표시

  // "best"     : 한 문항에 모든 방법의 결과를 보여주고 기준별로 가장 좋은 것 하나 선택 (문항 수 = 쌍 수)
  // "pairwise" : reference(우리 방법) vs baseline 하나씩 2AFC (문항 수 = 쌍 수 × baseline 수, sampling "one"이면 쌍 수)
  mode: "pairwise",
  // docs/plan.js(고정 문항 목록)가 있으면 그것을 쓰고 아래 pairwiseSampling 은 무시된다.
  // "one": 쌍마다 비교 방법 하나. 참가자 안에서 비교 방법별 문항 수가 같도록 돌려 배정 (1부: 5개 방법이 2~3번씩, 2부: 2개 방법이 2번씩)
  pairwiseSampling: "one",

  shuffleQuestions: true,  // 문항 순서 참가자별 랜덤 (묶음 안에서)
  shuffleCandidates: true, // 결과 영상 배치(A/B 위치) 랜덤. A/B 비교에서는 묶음마다 우리 방법이 정확히 절반씩 A/B
  // 일관성 체크: 앞쪽 문항을 A/B 위치만 바꿔 뒤쪽에 다시 출제. 숫자(모든 묶음에 같게) 또는 묶음별 { 묶음id: 개수 }
  repeatChecks: 0,

  // 묶음(부) 순서와 안내. manifest 의 pair.block 과 id 가 같아야 한다. {n} 은 그 묶음의 문항 수로 바뀐다
  blocks: [
    {
      id: "text",
      title: { ko: "글로 주어진 스타일", en: "Style given in words" },
      intro: {
        ko: `<p>이 부분에서는 목표 스타일이 <b>글</b>로 주어집니다. 오른쪽에 스타일 설명과, 그 스타일이 어떤 느낌인지 보여 주는 <b>예시 그림</b>이 함께 나옵니다.
예시 그림은 참고용이며, 결과가 그 그림과 똑같을 필요는 없습니다.</p>
<p>원본 영상과 두 결과(A, B)를 보고 항목별로 더 나은 쪽을 골라 주세요. 모두 {n}문항입니다.</p>`,
        en: `<p>In this part the target style is given <b>in words</b>. The panel on the right shows the style description and a few <b>example artworks</b> that illustrate the style.
The examples are for reference only; the results do not need to look exactly like them.</p>
<p>Watch the input video and the two results (A and B), and choose the better one for each criterion. There are {n} questions.</p>`,
      },
    },
    {
      id: "image",
      title: { ko: "그림으로 주어진 스타일", en: "Style given as an image" },
      intro: {
        ko: `<p>이 부분에서는 목표 스타일이 <b>그림 한 장</b>으로 주어집니다. 결과가 그 그림의 스타일(색, 붓 터치, 질감)을 얼마나 잘 따르는지 봐 주세요.</p>
<p>원본 영상과 두 결과(A, B)를 보고 항목별로 더 나은 쪽을 골라 주세요. 모두 {n}문항입니다.</p>`,
        en: `<p>In this part the target style is given as <b>a single image</b>. Please judge how well each result follows that image's style (colors, brushwork, texture).</p>
<p>Watch the input video and the two results (A and B), and choose the better one for each criterion. There are {n} questions.</p>`,
      },
    },
  ],

  showContent: true,       // 원본(입력) 영상 표시
  showStyle: true,         // 스타일 참조(그림, 또는 글 + 예시 그림) 표시
  requireFullPlay: true,   // 영상을 끝까지 한 번 본 뒤에만 다음 문항으로 진행 가능
  minSecondsPerQuestion: 0,

  estimatedMinutes: 15,
  askNickname: true,       // 시작 화면에서 닉네임 입력받기 (필수). 참가자 구분용, 응답과 함께 저장됨
  blockMobile: false,      // true면 휴대폰에서 참여 차단 (false면 경고만)
  contact: "",             // 문의처 (예: "abc@university.ac.kr") — 비우면 표시 안 함

  // 완료 화면에 보여줄 코드. 비우면 참가자 ID 기반 코드를 자동 생성. Prolific 등을 쓰면 고정 코드 + completionUrl 지정
  completionCode: "",
  completionUrl: "",

  title: {
    ko: "비디오 스타일 전이 사용자 평가",
    en: "Video Style Transfer User Study",
  },

  // 시작 화면 안내문 (HTML 허용). {minutes} 는 estimatedMinutes 로 치환됨
  intro: {
    ko: `<p>본 설문은 비디오 스타일 전이(video style transfer) 결과의 품질을 평가하기 위한 사용자 평가입니다.
각 문항에서 <b>원본 영상</b>, <b>목표 스타일</b>, 그리고 서로 다른 방법으로 만든 <b>결과 영상 두 개(A, B)</b>가 제시됩니다.
평가 항목별로 더 낫다고 생각하는 결과를 선택해 주세요.</p>
<ul>
  <li>예상 소요 시간: 약 {minutes}분 (두 부분, 모두 {questions}문항)</li>
  <li>실명, 이메일 등 개인을 식별할 수 있는 정보는 수집하지 않습니다 (참여자 구분용 닉네임만 입력받습니다). 응답은 연구 목적으로만 사용됩니다.</li>
  <li>참여는 자발적이며 언제든지 중단할 수 있습니다.</li>
  <li>PC(데스크톱/노트북)의 큰 화면과 안정적인 네트워크 환경을 권장합니다.</li>
</ul>`,
    en: `<p>This study evaluates the quality of video style transfer results.
Each question shows an <b>input video</b>, the <b>target style</b>, and <b>two stylized results (A and B)</b> produced by different methods.
For each criterion, please choose the result you think is better.</p>
<ul>
  <li>Estimated time: about {minutes} minutes (two parts, {questions} questions in total)</li>
  <li>No personally identifiable information is collected (only a nickname to tell participants apart). Responses are used for research purposes only.</li>
  <li>Participation is voluntary and you may stop at any time.</li>
  <li>A desktop or laptop with a large screen and a stable network connection is recommended.</li>
</ul>`,
  },

  // 평가 방법 화면에 덧붙이는 설명 (HTML 허용)
  instructionsNote: {
    ko: `<p>설문은 두 부분입니다. <b>1부</b>는 목표 스타일이 글(과 예시 그림)로, <b>2부</b>는 그림 한 장으로 주어집니다.</p>`,
    en: `<p>The study has two parts. In <b>Part 1</b> the target style is given in words (with example artworks); in <b>Part 2</b> it is given as a single image.</p>`,
  },

  // 평가 기준 (문항마다 이 순서대로 질문). id 는 분석 결과 표의 열 이름이 된다. descByBlock 으로 묶음별 문구를 바꿀 수 있다
  criteria: [
    {
      id: "overall",
      label: { ko: "전체 품질", en: "Overall quality" },
      desc: {
        ko: "전체적인 완성도(화질, 자연스러움)가 더 좋은 결과는?",
        en: "Which result has better overall quality (image quality, naturalness)?",
      },
    },
    {
      id: "style",
      label: { ko: "스타일 표현", en: "Stylization" },
      desc: {
        ko: "스타일 참조 그림의 스타일(색, 붓 터치, 질감)을 더 잘 표현한 결과는?",
        en: "Which result better expresses the style (colors, brushwork, texture) of the style image?",
      },
      descByBlock: {
        text: {
          ko: "제시된 스타일(설명과 예시 그림)을 더 잘 표현한 결과는?",
          en: "Which result better expresses the described style (see the description and example artworks)?",
        },
      },
    },
    {
      id: "content",
      label: { ko: "내용 일치도", en: "Content fidelity" },
      desc: {
        ko: "원본 영상과 내용(물체의 모양, 구조, 움직임)이 더 잘 일치하는 결과는?",
        en: "Which result better matches the content of the input video (object shapes, structure, motion)?",
      },
    },
    {
      id: "flicker",
      label: { ko: "깜빡임 (Flickering)", en: "Temporal consistency (flickering)" },
      desc: {
        ko: "프레임 사이의 깜빡임이나 떨림이 더 적은 결과는?",
        en: "Which result has less flickering or jitter between frames?",
      },
    },
  ],

  // 마지막 설문 항목. type: "choice" | "text"
  survey: [
    {
      id: "expertise",
      type: "choice",
      required: true,
      label: {
        ko: "컴퓨터 비전 / 그래픽스 / 영상 편집 분야 경험이 있으신가요?",
        en: "Do you have experience in computer vision, graphics, or video editing?",
      },
      options: [
        { value: "none", label: { ko: "없음", en: "None" } },
        { value: "some", label: { ko: "약간 있음 (취미, 수업 등)", en: "Some (hobby, coursework)" } },
        { value: "expert", label: { ko: "전문가 (관련 연구/업무)", en: "Expert (research or professional)" } },
      ],
    },
    {
      id: "comment",
      type: "text",
      required: false,
      label: { ko: "기타 의견 (선택)", en: "Any comments (optional)" },
    },
  ],
};
