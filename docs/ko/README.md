# Shift Feel

[English](../../README.md) | [한국어](README.md)

Shift Feel은 수동변속 차량의 운전 감각을 연습하기 위한 실험적인 React Native 앱입니다. 랩 타임이나 레이싱보다 H-패턴 기어 셀렉터, 클러치, 브레이크, 스로틀, 엔진 회전수와 변속 피드백 사이의 상호작용에 초점을 맞춥니다.

> 프로젝트 문서의 기준 언어는 영어입니다. 한국어 문서와 내용이 다를 경우 [영문 README](../../README.md)를 우선합니다.

## 데모

![iPhone 시뮬레이터에서 실행 중인 Shift Feel](../assets/shift-feel-demo.gif)

iPhone 16 Pro 시뮬레이터에서 실행한 iOS 앱을 녹화했습니다.

## 현재 기능

- 후진 및 1–5단을 지원하는 대화형 H-패턴 셀렉터
- 클러치, 브레이크, 스로틀을 각각 조작할 수 있는 터치 컨트롤
- RPM, 속도, 엔진 상태와 변속 결과를 계산하는 결정론적 차량 시뮬레이션
- 부드러운 변속, 변속 충격, 거부된 변속과 시동 꺼짐에 대한 피드백
- 엔진 RPM을 FMOD 이벤트에 매핑하는 선택적 네이티브 FMOD 브리지
- 시뮬레이션 로직, 입력 계산, 기어 선택과 UI 통합에 대한 단위 테스트

이 프로젝트는 활발히 개발 중인 프로토타입입니다. 실제 운전 교육을 대체하지 않으며, 실제 차량을 공학적으로 정확하게 모델링하지 않습니다.

## 빠른 시작

### 사전 요구 사항

- Node.js 22.11 이상
- npm
- iOS: Xcode 및 CocoaPods
- Android: Android Studio 및 Android SDK

### 설치 및 실행

```sh
nvm use
npm ci
npm start
```

iOS를 처음 설정할 때는 Ruby 의존성과 CocoaPods를 설치합니다.

```sh
bundle install
bundle exec pod install --project-directory=ios
```

두 번째 터미널에서 원하는 플랫폼을 실행합니다.

```sh
npm run ios
# 또는
npm run android
```

로컬에 FMOD를 설치하지 않아도 시뮬레이션을 실행할 수 있습니다. 네이티브 엔진 오디오는 선택 기능이며, 독점 FMOD SDK를 로컬에 설치해야 사용할 수 있습니다. 자세한 내용은 [FMOD 설정 문서](../fmod-setup.md)를 참고하세요.

### 변경 사항 검증

```sh
npm run typecheck
npm run lint
npm test -- --runInBand
```

## 프로젝트 구조

```text
app/features/
  controls/       운전 컨트롤 구성
  dashboard/      RPM, 속도, 기어 및 피드백 표시
  engine-audio/   선택적 네이티브 오디오 경계
  engine-sim/     결정론적 차량 시뮬레이션
  gearbox/        H-패턴 히트 테스트 및 선택
  pedals/         멀티터치 페달 입력 계산 및 UI
docs/             공개 프로젝트 문서
scripts/          로컬 FMOD 설정 도우미
```

## 문서

- [아키텍처](../architecture.md)
- [설계 결정](../decisions.md)
- [로드맵](../roadmap.md)
- [릴리스 빌드](../releasing.md)
- [기기 QA](../device-qa.md)
- [FMOD 설정 및 배포 규칙](../fmod-setup.md)
- [서드파티 고지](../../THIRD_PARTY_NOTICES.md)
- [개인정보 처리방침](../../PRIVACY.md)
- [기여 안내](../../CONTRIBUTING.md)
- [보안 정책](../../SECURITY.md)

## 기여하기

버그 신고, 실제 기기 테스트 결과, 시뮬레이션 개선, 접근성 피드백과 문서 수정 기여를 환영합니다. 이슈나 풀 리퀘스트를 열기 전에 [기여 안내](../../CONTRIBUTING.md)를 읽어 주세요.

## 라이선스

이 저장소의 소스 코드는 서드파티 소프트웨어와 에셋을 제외하고 [MIT 라이선스](../../LICENSE)에 따라 배포됩니다. FMOD SDK 파일과 FMOD 예제 미디어는 이 저장소에 포함되지 않으며 각각의 별도 이용 조건이 적용됩니다. 자세한 내용은 [서드파티 고지](../../THIRD_PARTY_NOTICES.md)를 참고하세요.
