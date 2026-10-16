# Data, Please. 도트 시제품

[← 기획서 목차로](../README.md)

`digital-guard-pixel.html` 하나만 브라우저로 열면 됩니다. 인터넷 연결 없이 동작하고, 진행 기록은 그 브라우저에만 저장됩니다.

- Unity 게임이 아니라 **화면과 조작을 확인하는 HTML 시제품**입니다.
- **v0.4**: 메인(사운드·설정·일반 모드·경쟁 모드·랭킹) → 난이도 4단계 → 브리핑 → 창구형 인게임 → 근무 결과 → 랭킹. 인게임 왼쪽 위 ⏸로 일시정지·설정·나가기, 설정에서 분위기 어둡게/밝게.
- 체험판 사건 6건을 난이도별로 나눠 대조·깃발·자료 조회·승인/거부/추가 확인·신고·2단계 판정을 해 볼 수 있습니다.
- 랭킹은 이 브라우저 안의 기록만 보여 줍니다.
- 게임 화면에는 튜토리얼·안내 문구가 없습니다. 조작과 규칙은 [플레이 가이드](../play-guide.md)를 보세요.
- 화면 설명은 [기획서 15장](../11-modes-and-ui.md), v0.3까지의 구현 범위는 [8.4](../05-visual-themes.md#84-도트-테마-html-시제품-v02)에 있습니다.

## 고치고 다시 만들기

화면과 사건 데이터는 `src/game.html`에 있습니다. 글꼴을 넣어 최종 파일을 만들려면:

```bash
npm install galmuri          # 갈무리 글꼴 (SIL OFL 1.1)
pip install fonttools brotli
python3 src/build.py node_modules/galmuri/dist
```

`src/build.py`가 글꼴을 필요한 글자만 남겨 줄인 뒤 `digital-guard-pixel.html`에 넣습니다.

## 글꼴 라이선스

갈무리(Galmuri) © 2019–2025 Lee Minseo, SIL Open Font License 1.1 — 전문은 [OFL-Galmuri.md](OFL-Galmuri.md), 원본 https://github.com/quiple/galmuri
