# Shift Feel 한국어 안내

Shift Feel은 수동변속 차량의 조작 감각을 연습하기 위한 실험적인 React Native 앱입니다. H-패턴 기어 선택, 클러치·브레이크·스로틀 입력, RPM·속도 변화, 변속 피드백을 중심으로 구성되어 있습니다.

영문 문서가 기준 문서이며, 이 폴더의 한국어 문서는 보조 안내입니다. 구현 또는 정책이 달라 보이면 영문 문서를 우선합니다.

## 시작하기

```sh
npm ci
npm start
```

다른 터미널에서 `npm run ios` 또는 `npm run android`를 실행합니다. FMOD는 선택 기능이므로 설치하지 않아도 시뮬레이션과 UI는 실행됩니다. 네이티브 엔진 사운드를 사용하려면 영문 [FMOD 설정 문서](../fmod-setup.md)를 따르세요.

## 문서

- [프로젝트 개요와 실행 방법](../../README.md)
- [아키텍처](../architecture.md)
- [로드맵](../roadmap.md)
- [기여 방법](../../CONTRIBUTING.md)
- [FMOD 및 제3자 고지](../../THIRD_PARTY_NOTICES.md)

실제 운전 교육을 대체하는 앱은 아니며, 실제 차량의 물리 모델을 정밀하게 재현하지 않습니다.
