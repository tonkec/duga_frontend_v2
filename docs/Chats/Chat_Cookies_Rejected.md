### Chat Access Behavior When Cookies Are Rejected

**ST-025 Hide/disable chat entry points**

- **Given** I have clicked **“Odbij kolačiće”** in Settings page and consent is **rejected**
- **When** I view the header/sidebar
- **Then** the **Chat** entry point is **hidden** or **disabled** with a tooltip: “Chat je nedostupan bez kolačića”

**ST-026 Block deep links to chat**

- **Given** consent is **rejected**
- **When** I navigate directly to **/new-chat** or **/chat/:chatId** (URL/deep link)
- **Then** I am **blocked** from accessing chat
- **And** I see a banner/toast: “Za korištenje chata potrebno je prihvatiti kolačiće”
- **And** I’m redirected to a **safe page** (e.g., /)

**ST-027 Existing chat sessions are terminated**

- **Given** I currently have a chat tab open and connected
- **When** I go to **Postavke** and click **“Odbij kolačiće”**
- **Then** the **socket disconnects** and chat UI shows a **disabled state** or **blocking banner**
- **And** sending messages/uploads is **disabled**
- **And** a toast appears explaining why chat is unavailable

**ST-028 No chat storage after rejection**

- **Given** consent is **rejected**
- **When** I inspect storage
- **Then** chat-related **cookies/localStorage/indexedDB** keys required for chat are **cleared/not written**
- **And** subsequent chat requests **do not set** those cookies

**ST-029 Re-enable cookies restores chat**

- **Given** consent is **rejected** and chat is unavailable
- **When** I change consent to **accepted** (flow in your app) and refresh
- **Then** chat entry points **reappear** and are **clickable**
- **And** navigating to **/new-chat** and opening **/chat/:chatId** connects successfully
- **And** I see a **success toast** “Chat je ponovno omogućen”

**ST-030 Analytics separation**

- **Given** consent is **rejected**
- **When** I use the rest of the app (non-chat)
- **Then** **analytics/marketing** cookies remain **off**
- **And** only **strictly necessary** cookies used for auth/session persist (chat still blocked)

**ST-031 Error/edge behaviors**

- **When** cookie rejection change fails to persist (storage/API error)
- **Then** I see an **error toast** and chat availability **does not change** until retried
