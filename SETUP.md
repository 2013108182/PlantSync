# 🌿 PlantSync 설정 가이드

부부 전용 식물 관리 앱입니다. Firebase와 두 개의 API만 연결하면 바로 사용할 수 있어요.

---

## 1단계: 패키지 설치

```bash
cd PlantSync
npm install
```

---

## 2단계: Firebase 프로젝트 만들기

1. [Firebase Console](https://console.firebase.google.com) 접속
2. **프로젝트 추가** → 프로젝트 이름 입력 (예: `plantsync`)
3. 왼쪽 메뉴 **빌드 > Firestore Database** → **데이터베이스 만들기** → 테스트 모드로 시작
4. 왼쪽 메뉴 **빌드 > Storage** → **시작하기** → 테스트 모드로 시작
5. **프로젝트 설정** (⚙️ 아이콘) > **일반** > 스크롤 내려서 **앱 추가** > 웹 앱 (</>) 선택
6. 앱 등록 후 표시되는 `firebaseConfig` 값 복사

---

## 3단계: API 키 발급

### Plant.id (식물 인식)
1. [https://plant.id](https://plant.id) 접속 → 회원가입
2. Dashboard에서 API Key 복사

### Perenual (급수 주기)
1. [https://perenual.com/docs/api](https://perenual.com/docs/api) 접속 → 회원가입
2. 무료 API 키 발급 (500 요청/월)

---

## 4단계: .env 파일 생성

프로젝트 루트에 `.env` 파일을 만들고 아래 내용을 채워주세요:

```env
VITE_FIREBASE_API_KEY=여기에_붙여넣기
VITE_FIREBASE_AUTH_DOMAIN=프로젝트ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=프로젝트ID
VITE_FIREBASE_STORAGE_BUCKET=프로젝트ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=숫자ID
VITE_FIREBASE_APP_ID=앱ID

VITE_PLANT_ID_API_KEY=여기에_붙여넣기
VITE_PERENUAL_API_KEY=여기에_붙여넣기
```

---

## 5단계: 앱 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 열기 → 완료! 🎉

---

## 6단계: 모바일에서 사용하기

같은 Wi-Fi 환경에서:

```bash
npm run dev -- --host
```

터미널에 표시되는 `Network: http://192.168.x.x:5173` 주소를 폰 브라우저에서 열면 돼요.

> 💡 **팁**: 주소창에서 "홈 화면에 추가"를 하면 앱처럼 사용할 수 있어요!

---

## Firestore 보안 규칙 (실서비스 전)

테스트가 끝나면 Firebase Console > Firestore > 규칙에서 아래로 변경하세요:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /plants/{document} {
      allow read, write: if true; // 부부 전용이므로 공개 접근 허용
    }
  }
}
```

---

## 폴더 구조

```
PlantSync/
├── src/
│   ├── api/
│   │   └── plantApi.js        ← Plant.id, Perenual API 연동
│   ├── components/
│   │   ├── UserToggle.jsx     ← 아내/남편 전환 토글
│   │   ├── PlantCard.jsx      ← 식물 카드 (D-Day, 물주기 버튼)
│   │   ├── AddPlantModal.jsx  ← 식물 등록 (사진 → AI 인식)
│   │   ├── EditPlantModal.jsx ← 식물 정보 수정
│   │   ├── SettingsModal.jsx  ← 유저 이름 설정
│   │   └── DeleteConfirmModal.jsx
│   ├── hooks/
│   │   ├── usePlants.js       ← Firestore 실시간 동기화
│   │   └── useUser.js         ← 유저 상태 (localStorage)
│   ├── firebase.js            ← Firebase 초기화
│   ├── App.jsx                ← 메인 대시보드
│   └── main.jsx
├── .env                       ← 여기에 API 키 입력!
├── .env.example               ← 양식 참고용
└── package.json
```
