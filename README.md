# Met Again

MVP random video chat kiểu OmeTV với monorepo đơn giản:
- `client/`: Vue 3 + Composition API + Vite
- `server/`: Express.js + Socket.IO + MongoDB/Mongoose

## Tính năng hiện có

- Xin quyền camera/microphone khi mở app
- Kết nối Socket.IO để matchmaking và signaling
- `Start` để vào hàng chờ random match
- Ghép cặp ngẫu nhiên 2 user đang rảnh
- Call video/audio P2P qua WebRTC
- `Next` để bỏ qua partner hiện tại và vào match mới
- Text chat cơ bản trong phiên call
- Bật/tắt mic, bật/tắt camera
- Trạng thái `ready`, `searching`, `connecting`, `connected`, `disconnected`
- Cleanup peer connection khi `next`, mất kết nối, đóng tab
- Reporting cơ bản
- Lưu session history và report tối thiểu vào MongoDB

## Cấu trúc thư mục

```text
.
├─ client/
│  ├─ .env.example
│  ├─ src/
│  │  ├─ components/
│  │  ├─ composables/
│  │  ├─ constants/
│  │  ├─ services/
│  │  ├─ App.vue
│  │  └─ main.js
│  └─ vite.config.js
├─ server/
│  ├─ .env.example
│  └─ src/
│     ├─ config/
│     ├─ models/
│     ├─ services/
│     ├─ socket/
│     ├─ app.js
│     └─ server.js
└─ .github/
   ├─ docs/
   └─ workflows/ci.yml
```

## Yêu cầu môi trường

- Node.js 20+
- MongoDB local đang chạy, ví dụ `mongodb://127.0.0.1:27017/met_again`
- Browser hỗ trợ WebRTC

## Cách chạy local

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo file env

Server:

```bash
cp server/.env.example server/.env
```

Client:

```bash
cp client/.env.example client/.env
```

Windows PowerShell có thể dùng:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

### 3. Chạy MongoDB

Đảm bảo MongoDB local đang chạy trên URL trong `server/.env`.

### 4. Chạy server

```bash
npm run dev:server
```

Server mặc định chạy ở `http://localhost:3000`.

### 5. Chạy client

Terminal khác:

```bash
npm run dev:client
```

Client mặc định chạy ở `http://localhost:5173`.

### 6. Chạy cả hai cùng lúc

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Các socket event quan trọng

### Client -> Server

- `match:enqueue`: user vào queue
- `match:next`: bỏ qua partner hiện tại và tìm match mới
- `signal:offer`: gửi WebRTC offer
- `signal:answer`: gửi WebRTC answer
- `signal:ice-candidate`: gửi ICE candidate
- `chat:message`: gửi text chat trong session hiện tại
- `media:state`: sync trạng thái mic/camera hiện tại sang partner
- `session:connected`: báo server biết phiên đã connected
- `session:report`: gửi report partner hiện tại

### Server -> Client

- `queue:joined`: xác nhận user đã vào queue
- `match:found`: báo đã tìm thấy partner, kèm `sessionId` và `initiator`
- `signal:offer`
- `signal:answer`
- `signal:ice-candidate`
- `chat:message`
- `partner:media-state`: sync trạng thái mic/camera của partner
- `session:ended`: phiên cũ kết thúc, có thể auto requeue
- `report:submitted`: xác nhận report đã được lưu
- `app:error`: lỗi realtime bất đồng bộ

## Cách chạy client

1. Vào app ở `http://localhost:5173`
2. Cho phép camera/microphone
3. Bấm `Start`
4. Mở tab/browser khác để tự test flow match local

## Cách chạy server

1. Đảm bảo MongoDB đang bật
2. Chạy `npm run dev:server`
3. Kiểm tra health endpoint tại `http://localhost:3000/health`

## Lưu ý production

- Cần TURN server, không chỉ STUN, nếu muốn hoạt động ổn định sau NAT/firewall
- Matchmaking in-memory hiện không scale ngang; production nên chuyển sang Redis hoặc state broker
- Chưa có auth, rate limit, anti-abuse, moderation pipeline, block list
- Reporting hiện rất basic; production nên có taxonomy, review queue, audit trail tốt hơn
- Chưa có observability, metrics, tracing, retry policies, structured logging
- Cần HTTPS/WSS, secure cookie policy, CORS chặt hơn, và secret management
- Nên thêm test tự động cho queue race condition, disconnect handling, và stale signaling

## Ghi chú

- Đây là bản MVP ưu tiên clean structure và chạy local trước.
- Browser permission prompt chỉ hoạt động ổn định trên `localhost` hoặc HTTPS.
