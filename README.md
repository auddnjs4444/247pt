# 247 FITNESS — 공식 웹사이트

광주광역시 서구 금호동 24시간 프리미엄 헬스장 **247피트니스**의 원페이지 웹사이트입니다.

- 빌드 도구·프레임워크 없음 (순수 HTML / CSS / JavaScript)
- GitHub Pages에 그대로 배포 가능
- 모바일 우선 반응형, 다크 테마 + 브랜드 옐로우(`#ffd400`)

## 폴더 구조

```
.
├── index.html          메인 페이지 (전체 내용)
├── 404.html            404 페이지
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/style.css   전체 스타일 (디자인 토큰은 파일 최상단 :root)
    ├── js/main.js      스크롤 애니메이션 · 메뉴 · 갤러리
    └── img/            사진 폴더 (README.md 참고)
```

## 로컬에서 보기

`index.html`을 브라우저로 열어도 되고, 로컬 서버로 띄우려면:

```bash
python3 -m http.server 8000
```

그다음 브라우저에서 `http://localhost:8000` 접속.

## 사진 넣기

`assets/img/README.md`에 적힌 파일명 그대로 사진을 넣으면 자동 반영됩니다.
사진이 없으면 어두운 플레이스홀더가 표시되므로 레이아웃이 깨지지 않습니다.

## 자주 바꾸는 내용

| 바꿀 내용 | 위치 |
|---|---|
| 가격 | `index.html` → `<section id="pricing">` |
| 기구 대수 | `index.html` → `<section id="zones">` |
| 전화번호 | `index.html` 전체의 `0507-1417-3401` |
| 주소 | `index.html` → `id="location"` 과 푸터, 그리고 상단 JSON-LD |
| 브랜드 색상 | `assets/css/style.css` → `:root` 의 `--accent` |
| 배경(다크→라이트) | `assets/css/style.css` → `:root` 의 `--bg`, `--fg` 계열 |

## 배포 (GitHub Pages)

1. GitHub에서 저장소 생성 후 push
2. 저장소 **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**
3. 몇 분 뒤 `https://<계정명>.github.io/<저장소명>/` 에서 확인

## 도메인 연결 (예: `247fitness.co.kr`)

1. 저장소 루트에 `CNAME` 파일을 만들고 도메인만 한 줄로 적기
   ```
   247fitness.co.kr
   ```
2. 도메인 등록업체(가비아·후이즈 등) DNS 설정에서
   - `www` → CNAME → `<계정명>.github.io`
   - 루트(`@`) → A 레코드 4개
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
3. GitHub **Settings → Pages → Custom domain**에 도메인 입력 → `Enforce HTTPS` 체크

도메인 확정 후에는 `index.html`의 `canonical`·`og:url`, `robots.txt`, `sitemap.xml`의 주소도
실제 도메인으로 함께 바꿔주세요.

## 정보 출처

네이버 플레이스 상세정보 기준. 운영 정보가 바뀌면 위 표의 위치에서 수정하면 됩니다.
