# 🔪 캐치킬러 — 게스트하우스 살인사건

<p align="center">
  <img src="backend/src/main/resources/static/posters/catchkiller.jpg" alt="캐치킬러 포스터" width="360">
</p>

<p align="center">
  세종극회 제 90회 정기공연 《캐치킬러》 프로모션 사이트<br>
  관객이 직접 사건을 추리하고 범인을 지목하는 <b>참여형 추리극</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?logo=springboot&logoColor=white">
  <img src="https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white">
  <img src="https://img.shields.io/badge/DB-H2-blue?logo=h2&logoColor=white">
  <img src="https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow?logo=javascript&logoColor=white">
</p>

---

## 🎭 소개

게스트하우스에서 벌어진 살인 사건. 용의자는 셋 — 관객은 시놉시스와 각 인물의 진술을 읽고,
누가 진범인지 투표로 지목한다. 이 저장소는 그 공연을 홍보하고 관객 참여(투표)를 받는 웹사이트다.

빌드 도구나 프론트엔드 프레임워크 없이, **Spring Boot가 정적 파일을 서빙하고 투표 API만 담당하는**
가벼운 구조로 만들어졌다.

## ✨ 주요 기능

- **인트로 스크램블 애니메이션** — 글자가 무작위로 조합되며 등장하는 도입부
- **CAST / SUSPECTS 카드 캐러셀** — 등장인물·용의자를 넘겨보는 커버플로우 스타일 카드, 클릭 시 뒤집혀 진술/검거 사진 공개
- **캐스팅 일정 모달** — 회차별 배우 배정을 담은 표를 페이지 이탈 없이 확인
- **실시간 배심원 투표** — 방문자가 용의자를 선택해 투표, 서버(H2 DB)에 집계 저장
- **범인 찾기 서브페이지** — 세종극회 이전 공연 포스터를 마퀴로 훑어보는 별도 페이지
- 모바일 우선으로 설계된 반응형 레이아웃

## 🛠 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Backend | Spring Boot 4.1 (Java 21), Spring Data JPA |
| Database | H2 (파일 기반) |
| Frontend | 순수 HTML / CSS / JavaScript (빌드 스텝 없음) |

## 🚀 로컬 실행

```bash
cd backend
./mvnw.cmd spring-boot:run   # Windows
./mvnw spring-boot:run       # macOS / Linux
```

기본 접속 주소: `http://localhost:8080` (환경에 따라 `application.properties`의 `server.port` 참고)

정적 리소스는 빌드 없이 바로 서빙되므로, `static/` 아래 HTML/CSS/JS를 수정하고 새로고침하면 바로 반영된다.

## 📁 프로젝트 구조

```
backend/
└─ src/main/
   ├─ java/com/sejong/catchkiller/vote/   # 투표 API (GET/POST /api/votes)
   └─ resources/
      ├─ application.properties
      └─ static/
         ├─ index.html          # 메인 페이지
         ├─ 범인찾기.html         # 서브 페이지
         ├─ style.css / hunt.css
         ├─ script.js
         ├─ cast/                # 배우 프로필/검거 사진
         └─ posters/             # 포스터 이미지
```

## 🎟 공연 정보

| | |
|---|---|
| **일시** | 9.8 – 9.11 19:30 · 9.12 14:00 / 19:00 |
| **장소** | 세종극회 소극장 |
| **러닝타임** | 100분 |
| **관람등급** | 전체 이용가 |
| **티켓** | 6,000원 |
| **연출** | 황현문 |

📮 예매: [linktr.ee/sejongxdrama](https://linktr.ee/sejongxdrama)
📷 인스타그램: [@catch_killer_26](https://www.instagram.com/catch_killer_26/)

---

<p align="center"><sub>© 2026 세종극회 · SINCE 1979</sub></p>
