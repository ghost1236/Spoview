# SportsHub 프로젝트 규칙

## 코드 수정 후 검증 (필수)

모든 코드 수정 후 반드시 아래 검증을 통과해야 사용자에게 보고할 수 있다.

### 백엔드 (Spring Boot / Kotlin)
```bash
cd backend && ./gradlew compileKotlin
```
- BUILD SUCCESSFUL 확인 필수
- 서비스 레이어 수정 시 `./gradlew test`도 실행

### 프론트엔드 (Next.js)
```bash
cd frontend && rm -rf .next && npx next build
```
- **반드시 `rm -rf .next`로 캐시 삭제 후 클린 빌드**
- `✓ Compiled successfully` + `✓ Generating static pages` 까지 확인
- 캐시 빌드는 에러를 놓치므로 절대 사용 금지

### 에이전트 위임 시
- 에이전트 작업 결과를 맹신하지 않는다
- 에이전트 완료 후 반드시 직접 클린 빌드 + 테스트 실행
- 에러 0 확인 후에만 완료 보고

## JSX 주석 규칙

JSX에서 `{/* 주석 */}`은 아래 위치에서만 사용 가능:
- JSX 자식 요소 사이 (형제 위치)

아래 위치에서는 **절대 사용 금지** (빌드 에러 발생):
- `return (` 바로 뒤
- `&& (` 바로 뒤
- `.map(() => (` 바로 뒤
- JSX 속성 사이 (예: `disabled={true} {/* 주석 */} className="..."`)
- 삼항연산자 `? (` 또는 `: (` 바로 뒤

## 기술 스택

- Backend: Spring Boot 3.x, Kotlin, JPA, MariaDB, Redis
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- 다크모드: `data-theme="dark"` + CSS 변수 (Tailwind `dark:` 접두사 사용 금지)
- CSS 변수: `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-secondary`, `--text-tertiary`, `--brand-primary`
- 컴포넌트 클래스: `.sv-card`, `.sv-chip`, `.sv-btn`, `.sv-btn-primary`

## 아키텍처

- Controller → Service → Repository (@Transactional은 Service만)
- 인증: NextAuth (프론트) → JWT (백엔드)
- API 프록시: Next.js rewrites (`BASE_URL=""`, CORS 회피)
- 배포: Vercel (프론트) + NCP VPC (백엔드)
