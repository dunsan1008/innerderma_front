# InnerDerma 프론트엔드 배포 가이드

이 레포(`innerderma_front`)는 **독립 실행되는 서비스가 아니라 정적 빌드 산출물**입니다. `npm run build`로 나온 `dist/`가 InnerDerma 백엔드 레포(`InnerDerma`)의 nginx 컨테이너에 볼륨으로 마운트되어 `inner-derma.duckdns.org`의 `/*` 경로로 서빙됩니다. 자체 Dockerfile이나 컨테이너가 없고, 전체 인프라(nginx, 인증서, 도메인 라우팅)는 `INNERDERMA_DEPLOY_GUIDE.md`(InnerDerma 백엔드 레포 기준)를 따릅니다. 이 문서는 그중 **프론트엔드 담당 부분만** 떼어내 정리한 것입니다.

> **현재 상황**: 백엔드(app-api)와 SkinAge는 이미 서버에 떠 있는 상태. `INNERDERMA_DEPLOY_GUIDE.md`의 Step 1~5(SkinAge 스택 내리기, 백엔드 레포 클론, 인증서 발급, HTTPS 전환)는 이미 끝났다고 보고 **이 문서의 "최초 배포" 절차만** 따라가면 된다. 백엔드 쪽 설정(`.env`, nginx conf)을 직접 바꿀 필요는 없고, `FRONTEND_BUILD_PATH`가 이 레포의 실제 빌드 경로를 가리키는지 "확인"만 하면 된다(아래 참고).

## 이 레포가 서버에서 맡는 역할

```
inner-derma.duckdns.org
  ├─ /api/*        → app-api :8080 (InnerDerma 백엔드, 다른 레포)
  ├─ /swagger-ui/* → app-api :8080
  └─ /*            → /opt/innerderma-frontend/dist  ← 이 레포의 빌드 결과물
```

- 서버 경로: `/opt/innerderma-frontend` (레포 클론 위치), 빌드 산출물은 `/opt/innerderma-frontend/dist`
- 이 경로는 InnerDerma 백엔드 레포의 `/opt/innerderma.env`에 `FRONTEND_BUILD_PATH=/opt/innerderma-frontend/dist`로 지정되어 있고, nginx(frontend 컨테이너)가 이 경로를 읽어 서빙한다.
- 즉 **이 레포 단독으로 배포가 완결되지 않는다** — `npm run build`까지가 이 레포의 책임이고, 그 결과물을 nginx가 집어먹도록 하는 건 백엔드 인프라(InnerDerma 레포) 쪽 설정이다. 백엔드 스택이 먼저 떠 있어야(`FRONTEND_BUILD_PATH` 마운트 포함) 프론트 배포가 의미를 가진다.

## 최초 배포

```bash
sudo mkdir -p /opt/innerderma-frontend && sudo chown $USER:$USER /opt/innerderma-frontend
git clone https://github.com/dunsan1008/innerderma_front.git /opt/innerderma-frontend
cd /opt/innerderma-frontend/frontend

# 프로덕션에서는 VITE_API_BASE_URL을 비워둔다 — 같은 도메인의 /api/v1로 상대 호출하게 되고,
# nginx가 /api/*를 app-api로 라우팅하므로 별도 API 도메인 지정이 불필요하다.
npm install
npm run build
```

`vite build` 결과물은 `frontend/dist`에 생성된다. `FRONTEND_BUILD_PATH`가 이 경로(`/opt/innerderma-frontend/frontend/dist`)를 정확히 가리키는지 InnerDerma 백엔드 레포의 `.env`를 확인할 것 — `INNERDERMA_DEPLOY_GUIDE.md`에는 `/opt/innerderma-frontend/dist`로 되어 있는데, 이 레포는 `frontend/` 서브디렉토리에 소스가 있으므로 실제 빌드 경로는 `/opt/innerderma-frontend/frontend/dist`다. 서버에 처음 배포할 때 둘 중 어느 경로가 맞는지 반드시 확인하고, 필요하면 심볼릭 링크로 맞춘다:

```bash
# FRONTEND_BUILD_PATH가 /opt/innerderma-frontend/dist를 가리키는데
# 실제 빌드는 frontend/dist에 나온다면:
#
# 주의: INNERDERMA_DEPLOY_GUIDE.md Step 3에서 placeholder로 이미
# /opt/innerderma-frontend/dist 디렉토리(+ index.html)를 만들어뒀을 수 있다.
# 그 상태로 그냥 ln -s를 하면 대상이 이미 디렉토리라 안쪽에
# dist/dist로 링크가 생기려다 실패하고(권한도 보통 꼬여 있다),
# "Permission denied"가 뜬다. 먼저 placeholder를 지우고 링크를 건다
# (안에 placeholder index.html 외에 다른 게 없는지 ls -la로 먼저 확인).
ls -la /opt/innerderma-frontend/          # dist 소유자가 root인지, 상위 디렉토리 권한은 정상인지 확인
sudo rm -rf /opt/innerderma-frontend/dist
sudo ln -s /opt/innerderma-frontend/frontend/dist /opt/innerderma-frontend/dist
ls -la /opt/innerderma-frontend/dist      # frontend/dist를 가리키는 심볼릭 링크로 나오는지 확인
```

`rm -rf` 이후에도 같은 "Permission denied"가 반복된다면 `/opt/innerderma-frontend` 자체가 현재 사용자 소유가 아닐 가능성이 높다 — `sudo ln -s`로 강제 생성하거나, `sudo chown -R $USER:$USER /opt/innerderma-frontend`로 상위 디렉토리 소유권부터 바로잡는다.

빌드 후 nginx(frontend 컨테이너, InnerDerma 백엔드 레포 쪽)에 반영:

```bash
cd /opt/innerderma
docker compose --env-file /opt/innerderma.env -f docker-compose.prod.yml restart frontend
```

## 업데이트 배포 (수동, CI/CD 세팅 전 / 폴백용)

```bash
cd /opt/innerderma-frontend && git pull origin main
cd frontend && npm install && npm run build
cd /opt/innerderma
docker compose --env-file /opt/innerderma.env -f docker-compose.prod.yml restart frontend
```

## CI/CD (GitHub Actions 자동 배포)

`main` 브랜치에 push되면 `.github/workflows/deploy.yml`이 자동으로 배포한다. **빌드는 GitHub Actions 러너에서** 하고 `frontend/dist` 결과물만 서버로 `rsync`하는 방식이라, 서버에는 Node/npm/vite가 아예 필요 없다 — 지금까지 겪은 `vite: not found`, 심볼릭 링크 권한 문제 같은 클래스의 이슈가 원천적으로 사라진다.

```
GitHub Actions
  1. npm ci && npm run build            (frontend/ 디렉토리, 러너 위)
  2. rsync -avzr --delete frontend/dist/  →  /opt/innerderma-frontend/dist/   (서버)
  3. SSH로 docker compose restart frontend 실행
```

rsync 대상이 `/opt/innerderma-frontend/dist/`이므로, 서버에 레포를 클론해둘 필요도 없다 — 지금 수동으로 걸어둔 `frontend/dist` 심볼릭 링크는 rsync가 심볼릭 링크를 따라가므로 그대로 둬도 동작하지만, CI만 쓸 계획이면 굳이 유지하지 않고 `/opt/innerderma-frontend/dist`를 평범한 디렉토리로 되돌려도 무방하다(placeholder `index.html`은 첫 워크플로 실행 시 `--delete` 옵션으로 정리된다).

### 최초 설정 (한 번만)

**1. 배포 전용 SSH 키 생성** (개인 키와 분리):
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./innerderma-deploy-key -N ""
```

**2. 서버에 공개키 등록**:
```bash
cat innerderma-deploy-key.pub | ssh ubuntu@<서버IP> "cat >> ~/.ssh/authorized_keys"
```

**3. 배포 계정이 `docker compose`를 `sudo` 없이 실행 가능한지 확인** (워크플로가 SSH로 붙어 `docker compose restart`를 바로 실행하므로):
```bash
groups $USER | grep docker || sudo usermod -aG docker $USER   # docker 그룹에 없으면 추가 후 재로그인
```

**4. GitHub 레포 Settings → Secrets and variables → Actions → New repository secret**에 등록:

| Secret 이름 | 값 |
|---|---|
| `DEPLOY_HOST` | 서버 IP 또는 도메인 |
| `DEPLOY_USER` | `ubuntu` |
| `DEPLOY_SSH_KEY` | 위에서 만든 `innerderma-deploy-key` **프라이빗 키 파일 전체 내용** |

키 페어(`innerderma-deploy-key`, `innerderma-deploy-key.pub`)는 secret 등록 후 로컬에서 삭제해도 된다.

**5. 확인**: `main`에 push하거나 GitHub 레포의 Actions 탭 → `Deploy Frontend` → `Run workflow`(수동 트리거)로 실행 후 로그 확인. 실패하면 어느 step에서 막혔는지(빌드 vs rsync vs SSH 접속)로 원인이 갈린다 — rsync/SSH 단계 실패는 대부분 시크릿 값 오타나 서버 방화벽/authorized_keys 문제다.

## 검증

```bash
curl -fsSL https://inner-derma.duckdns.org/ | head -20   # index.html이 내려오는지
```

브라우저로 `https://inner-derma.duckdns.org` 접속 후:
- 하드 리프레시(캐시 무시)로 새 빌드가 반영됐는지 확인
- 로그인/회원가입 등 `/api`를 호출하는 플로우가 CORS 없이 동작하는지 확인 (백엔드 `CORS_ALLOWED_ORIGINS`가 이 도메인을 허용해야 함)
- 카메라를 쓰는 화면(피부 촬영)은 HTTPS 컨텍스트에서만 `navigator.mediaDevices`가 노출되므로, HTTP로 접속하면 조용히 실패한다 — 반드시 `https://`로 확인

## 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| 화면이 404 / 빈 페이지 | `FRONTEND_BUILD_PATH`가 실제 `dist` 경로와 다름 | 위 "최초 배포"의 경로 확인/심볼릭 링크 참고 |
| `ln: failed to create symbolic link '.../dist/dist': Permission denied` | `/opt/innerderma-frontend/dist`가 Step 3 placeholder로 이미 디렉토리로 존재 | `sudo rm -rf /opt/innerderma-frontend/dist` 후 다시 `ln -s` |
| 빌드는 성공했는데 브라우저에 반영 안 됨 | nginx가 이전 정적 파일 캐시 중이거나 `frontend` 컨테이너 재시작 안 함 | `docker compose restart frontend`, 브라우저 하드 리프레시 |
| API 호출이 CORS 에러 | 백엔드 `CORS_ALLOWED_ORIGINS`에 이 도메인이 없음 | InnerDerma 백엔드 레포의 `/opt/innerderma.env` 확인 (이 레포에서 고칠 수 있는 부분이 아님) |
| `/api/v1` 호출이 502/404 | app-api 컨테이너 미기동, 또는 `VITE_API_BASE_URL`을 잘못 설정해 다른 도메인을 바라봄 | 프로덕션 빌드에서는 `VITE_API_BASE_URL`을 비워 상대경로 호출로 두었는지 확인 |
| 카메라 기능만 안 됨 | HTTP로 접속함 (보안 컨텍스트 아님) | `https://inner-derma.duckdns.org`로 접속했는지 확인 |
| `sh: vite: not found` (`npm run build` 실패) | 서버에 `NODE_ENV=production`이 설정돼 있어 `npm install`이 devDependencies(`vite` 포함)를 건너뜀 | `echo $NODE_ENV`로 확인 후 `npm install --include=dev`로 재설치 |
| `npm run build` 실패 (그 외) | Node 버전 불일치 또는 `node_modules` 꼬임 | `rm -rf node_modules package-lock.json && npm install` 후 재시도 (단, `package-lock.json`을 지우는 건 사용자 확인 후) |

## 롤백

이 레포는 컨테이너가 아니라 정적 파일이므로 롤백은 이전 커밋으로 되돌려 다시 빌드하는 방식이다:

```bash
cd /opt/innerderma-frontend
git log --oneline -5          # 되돌릴 커밋 확인
git checkout <이전 커밋 해시>
cd frontend && npm install && npm run build
cd /opt/innerderma && docker compose --env-file /opt/innerderma.env -f docker-compose.prod.yml restart frontend
```

## 이 레포 배포 시 하지 않는 것

- 자체 도메인/인증서 발급, nginx 설정 변경, MySQL/백엔드 컨테이너 조작 — 전부 InnerDerma 백엔드 레포(`INNERDERMA_DEPLOY_GUIDE.md`)의 책임이며 이 레포에서 건드리지 않는다.
- `docker compose ... down` 등 다른 서비스(SkinAge, app-api, MySQL)에 영향을 줄 수 있는 명령은 이 레포 배포 작업 범위 밖이다. `frontend` 컨테이너 재시작 외의 compose 명령이 필요해 보이면 실행 전 사용자에게 먼저 확인한다.
