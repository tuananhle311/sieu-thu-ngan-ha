# Game Requirements: Lớp học Mật ngữ Siêu Thú Ngân Hà

## 1. Game Overview

### 1.1 Story
Do bản tính hiếu kỳ, nghịch ngợm, hai anh em Song Tử đã vô tình đánh thức toàn bộ quái thú trong cuốn "Bách Khoa Toàn Thư Siêu Thú Ngân Hà". Những quái thú này được cảnh báo sẽ gây ra vô vàn nguy hiểm khôn lường. Vì vậy, nhiệm vụ của 12 cung hoàng đạo là trong vòng 8 ngày phải thu phục các quái thú quay trở về cuốn sách.

Trong vai cung hoàng đạo của chính mình, người chơi sẽ hóa thân vào các Chiến Binh Huyền Thoại sở hữu những chiếc đùi gà với sức mạnh siêu nhiên để chiến đấu và thu phục các quái thú, giải cứu ngân hà khỏi hiểm họa diệt vong.

### 1.2 Win Condition
- Game kéo dài **8 vòng** (8 ngày)
- Kết thúc vòng 8, người chơi có **nhiều điểm chiến công nhất** sẽ thắng
- **Điều kiện thua chung**: Nếu không ai thu phục được Siêu Thú Cổ Đại nào → tất cả đều thua, Dải Ngân Hà bị phá hủy

---

## 2. Game Entities (Data Models)

### 2.1 Characters (Nhân vật) - 12 thẻ
Mỗi nhân vật là 1 cung hoàng đạo với **kỹ năng đặc biệt riêng**.

| ID | Tên | Kỹ năng | Thời điểm | Mô tả kỹ năng |
|----|-----|---------|-----------|---------------|
| 1 | Bạch Dương (Aries) | Chí mạng | Trong lượt | Khi đổ xí ngầu ra số chẵn (2,4,6) là sẽ chiến thắng bất kể chênh lệch sức mạnh |
| 2 | Kim Ngưu (Taurus) | Giả kim thuật | Bất cứ lúc nào | Bỏ 2 đùi gà để biến xí ngầu thành bất kỳ số nào bạn muốn từ 1 đến 6 |
| 3 | Song Tử (Gemini) | Sao chép | Bất cứ lúc nào | Thu thập lá bài bảo bối người khác vừa dùng về tay bạn |
| 4 | Cự Giải (Cancer) | Chúc phúc | Bất cứ lúc nào | Khi 1 người chơi khác chiến đấu, bạn đổ xí ngầu hỗ trợ thêm sức mạnh cho họ. Nếu người đó thắng, bạn nhận ké 2 điểm Chiến công |
| 5 | Sư Tử (Leo) | Tinh hoa | Bất cứ lúc nào | Quyết định 1 sự kiện sẽ tác động lên 1 người chơi theo ý mình |
| 6 | Xử Nữ (Virgo) | Đặt bẫy | Trong lượt | Bỏ 1 đùi gà để xoá bỏ sức mạnh cộng thêm trên thẻ của quái thú trong hang |
| 7 | Thiên Bình (Libra) | Triệu hồi | Trong lượt | Mượn sức mạnh từ tất cả các quái thú Lửa đang xuất hiện trong 5 hang. Mỗi quái thú Lửa cộng +1 Sức mạnh |
| 8 | Thiên Yết (Scorpio) | Hố đen | Trong lượt | Chọn 2 số bất kỳ trên xí ngầu. Đổ xí ngầu ra 1 trong 2 số vừa chọn sẽ được lấy 1 quái thú mà người chơi khác sở hữu |
| 9 | Nhân Mã (Sagittarius) | Cường hoá | Trong lượt | Đổ xí ngầu cộng thêm sức mạnh: 1-2 → +1, 3-4 → +2, 5-6 → +3 |
| 10 | Ma Kết (Capricorn) | Cổng lượng tử | Trong lượt | Bỏ 1 bảo bối trên tay để lấy 2 Bảo bối mới từ chồng bài chưa sử dụng |
| 11 | Bảo Bình (Aquarius) | Ảo thuật | Bất cứ lúc nào | Bất cứ khi nào bạn gieo xí ngầu, được lật ngược mặt xí ngầu (VD: đổ ra 6 → lật thành 1, đổ ra 2 → lật thành 5) |
| 12 | Song Ngư (Pisces) | Kết nối giấc mơ | Trong lượt | Bốc 1 thẻ quái thú chưa xuất hiện. Dự đoán thuộc tính (Lửa/Nước/Khí/Đất) trước khi mở. Nếu đoán đúng, quái thú đó thuộc về bạn |

**Skill Timing Types:**
- **Trong lượt (In Turn)**: Chỉ sử dụng được trong lượt của bản thân
- **Bất cứ lúc nào (Anytime)**: Có thể sử dụng bất cứ lúc nào, kể cả lượt người khác

### 2.2 Monsters (Quái thú) - 38 thẻ
Quái thú thuộc **4 hệ** tương ứng với 4 Siêu Thú Cổ Đại:

| Hệ | Siêu Thú Cổ Đại | Phần thưởng khi thu phục |
|----|-----------------|--------------------------|
| Lửa (Fire) | Cáo Lửa 9 Đuôi | +1 Sức mạnh vĩnh viễn |
| Nước (Water) | Bạch Tuộc Bất Mãn | +1 Thẻ bảo bối |
| Đất (Earth) | Người Đá Yêu Cây | +1 Đùi gà |
| Khí (Air) | Vẹt 4 Chân | +1 Điểm chiến công |

#### Quái thú hệ Lửa (10 thẻ)
| Tên | Power | Ghi chú |
|-----|-------|---------|
| Bò Mất Ngủ | +2 | |
| Công Lửa | +2 | |
| Dơi Mặt Trời | +2 | |
| Kiến Lân Tinh | +2 | |
| Sói Lửa | +2 | |
| Tinh Linh Lửa | +2 | |
| Báo Lửa | +3 | |
| Cú Lửa | +3 | |
| Rồng Ngủ Nướng | +4 | Yêu cầu 2 biểu tượng Lửa |
| Phượng Hoàng Ngàn Tuổi | +4 | Yêu cầu 2 biểu tượng Lửa |

#### Quái thú hệ Nước (9 thẻ)
| Tên | Power | Ghi chú |
|-----|-------|---------|
| Cà Rem Kem Chuối | +2 | |
| Nanh Trắng | +2 | |
| Ngọc Trai Vui Vẻ | +2 | |
| Sứa Điện | +2 | |
| Tiên Tôm Tích | +2 | |
| Tinh Linh Nước | +2 | |
| Cá Chuồn Chuồn | +3 | |
| Lạc Đà Chở Đảo | +3 | |
| Gấu Gai | +4 | Yêu cầu 2 biểu tượng Nước |

#### Quái thú hệ Khí (9 thẻ)
| Tên | Power | Ghi chú |
|-----|-------|---------|
| Chong Chóng Bà Tám | +2 | |
| Heo Siêu Âm | +2 | |
| Nấm Hát Hò | +2 | |
| Ong Ồn Ào | +2 | |
| Khói Xây Xẩm | +2 | |
| Rồng Giá Rét | +3 | |
| Tinh Linh Khí | +3 | |
| Cây Đào Ngàn Tuổi | +4 | Yêu cầu 2 biểu tượng Khí |
| Tia Chớp | +4 | Yêu cầu 2 biểu tượng Khí |

#### Quái thú hệ Đất (10 thẻ)
| Tên | Power | Ghi chú |
|-----|-------|---------|
| Cây Ăn Chay | +2 | |
| Củ Cải Vui Vẻ | +2 | |
| Gấu Mèo Măng Cụt | +2 | |
| Sâu 3 Ngấn | +2 | |
| Tắc Kè Biến Hình | +2 | |
| Cá Sấu Bụng Bự | +3 | |
| Tinh Linh Đất | +3 | |
| Rau Muống Lực Lưỡng | +4 | Yêu cầu 2 biểu tượng Đất |
| Rùa Ngủ Quên | +4 | Yêu cầu 2 biểu tượng Đất |

**Thuộc tính quái thú:**
- `id`: Mã định danh
- `name`: Tên quái thú
- `element`: Hệ (Lửa/Nước/Đất/Khí)
- `power`: Sức mạnh cộng thêm (+2, +3, +4)
- `reward`: Phần thưởng theo hệ
- `requirement`: Yêu cầu đặc biệt (nếu có)

### 2.3 Ancient Super Beasts (Siêu Thú Cổ Đại) - 4 tượng
| ID | Tên | Hệ | Yêu cầu thu phục | Điểm chiến công | Phần thưởng ngay | Bonus hàng ngày |
|----|-----|----|------------------|-----------------|------------------|-----------------|
| 1 | Cáo Lửa 9 Đuôi | Lửa | 2 quái thú Lửa + 1 quái thú bất kỳ | 3 điểm | +2 Sức mạnh vĩnh viễn | +1 Sức mạnh mỗi chiến đấu |
| 2 | Bạch Tuộc Bất Mãn | Nước | 2 quái thú Nước + 1 quái thú bất kỳ | 3 điểm | 2 Thẻ bảo bối | +1 Bảo bối mỗi ngày |
| 3 | Người Đá Yêu Cây | Đất | 2 quái thú Đất + 1 quái thú bất kỳ | 3 điểm | 2 Đùi gà | +1 Đùi gà mỗi ngày |
| 4 | Vẹt 4 Chân | Khí | 2 quái thú Khí + 1 quái thú bất kỳ | 3 điểm | 2 Điểm chiến công | +1 Điểm mỗi ngày |

### 2.4 Treasure Cards (Thẻ bảo bối) - 48 thẻ
**2 loại:**
| Loại | Màu | Điều kiện sử dụng |
|------|-----|-------------------|
| Instant | Xanh | Có thể sử dụng BẤT CỨ LÚC NÀO |
| Action | Đỏ | Chỉ sử dụng trong LƯỢT CỦA BẠN |

#### Danh sách thẻ bảo bối:
| Tên | Số lượng | Hiệu ứng |
|-----|----------|----------|
| Kính Cường Lực | 5 | Vô hiệu hóa thẻ bảo bối đối thủ vừa sử dụng |
| Bánh Mì La Liếm | 4 | Nhận 1 điểm chiến công khi đối thủ nhận điểm |
| Gương Hoán Đổi | 3 | Đổi quái thú của bạn với quái thú của đối thủ |
| Yoyo Thôi Miên | 2 | Lấy thẻ quái thú của đối thủ |
| Bùa Số 1 | 1 | Đặt kết quả xúc xắc thành 1 |
| Bùa Số 2 | 1 | Đặt kết quả xúc xắc thành 2 |
| Bùa Số 3 | 1 | Đặt kết quả xúc xắc thành 3 |
| Bùa Số 4 | 1 | Đặt kết quả xúc xắc thành 4 |
| Bùa Số 5 | 1 | Đặt kết quả xúc xắc thành 5 |
| Bùa Số 6 | 1 | Đặt kết quả xúc xắc thành 6 |
| Miễn Phí Vào Cổng | 1 | Vào hang mà không cần trả đùi gà |
| Găng Tay Đạo Chích | 1 | Lấy cắp thẻ bảo bối của đối thủ |
| Thẻ Mượn Thú | 1 | Mượn sức mạnh Lửa từ đối thủ trong chiến đấu |
| Bùa Sai Khiến | 1 | Bắt đối thủ chiến đấu cùng bạn |
| Nước Thanh Tẩy | 1 | Đổi quái thú của bạn với quái thú trong hang mà không cần chiến đấu |
| Gối Ru Ngủ | 1 | Ngăn đối thủ sử dụng quái thú/bảo bối |
| Đùi Gà Thuần Chủng | 1 | Kích hoạt khi đối thủ nhận quái thú |
| Kính Mắt Thờ Ơ | 1 | Bỏ qua hiệu ứng thẻ sự kiện |
| Sách Khai Sáng | 1 | Khôi phục khả năng kỹ năng nhân vật |
| Chổi Xí Xoá | 1 | Hủy thẻ quái thú của đối thủ |
| Vitamin Siêu Cấp | 1 | Cộng thêm xúc xắc cho đồng minh trong chiến đấu |
| Trượng 2-1 | 1 | Thắng chiến đấu nếu đổ ra 1 hoặc 2 |
| Khiên 4-3 | 1 | Thắng chiến đấu nếu đổ ra 3 hoặc 4 |
| Kiếm 6-5 | 1 | Thắng chiến đấu nếu đổ ra 5 hoặc 6 |

**Thuộc tính:**
- `id`: Mã định danh
- `name`: Tên bảo bối
- `type`: "instant" | "action"
- `quantity`: Số lượng trong bộ bài
- `effect`: Hiệu ứng
- `description`: Mô tả chi tiết

### 2.5 Event Cards (Thẻ sự kiện) - 22 thẻ
Gây ra các tình huống ngẫu nhiên ảnh hưởng đến tất cả hoặc một số người chơi.

#### Sự kiện phần thưởng (Reward Events):
| Tên | Hiệu ứng |
|-----|----------|
| Sinh Nhật Vui Vẻ | Người đổ xúc xắc cao nhất nhận đùi gà |
| Thương Gia Xứ Lạ | Người thắng nhận bảo bối ngẫu nhiên |
| Rương Phép Thuật | Đổ xúc xắc quyết định nhận/mất quái thú/bảo bối/đùi gà |
| Giày Của Gió | Người điểm thấp nhất đổ xúc xắc nhận điểm chiến công |
| Nâng Cấp Quái Thú | Đổi đùi gà + quái thú để lấy quái thú trong hang + phần thưởng |

#### Sự kiện phạt (Penalty Events):
| Tên | Hiệu ứng |
|-----|----------|
| Lệnh Triệu Tập | Đổ lẻ thì bỏ lượt |
| Bảo Bối Đi Lạc | Mất bảo bối ngẫu nhiên |
| Gấu Mèo Tặc | Người giàu nhất mất đùi gà |
| Nhà Giả Kim | Trả đùi gà để lấy cắp từ người khác |

#### Sự kiện trung lập (Neutral Events):
| Tên | Hiệu ứng |
|-----|----------|
| Hoàn Trả Đùi Gà | Hoàn lại đùi gà khi thu phục hang thành công |
| Vé Đặt Cược | Dự đoán kết quả chiến đấu, đúng +2 điểm chiến công |
| Cửa Hàng Bí Mật | Mua bảo bối bằng đùi gà |
| Tiệm Cầm Đồ | Đổi bảo bối lấy đùi gà |
| Giếng Nước Mát Mẻ | Khôi phục tất cả kỹ năng |
| Lá Lành Đùm Lá Rách | Chia đều đùi gà cho tất cả |
| Quà Tặng Thần Lửa | Người đổ cao nhất nhận quái thú Lửa |
| Quà Tặng Thần Nước | Người đổ cao nhất nhận quái thú Nước |
| Quà Tặng Thần Khí | Người đổ cao nhất nhận quái thú Khí |
| Quà Tặng Thần Đất | Người đổ cao nhất nhận quái thú Đất |
| Điểm Danh Đột Xuất | Nhận bonus thẻ quái thú ngay lập tức |
| Chiến Công Đội Nhóm | Thử thách hang động hợp tác |
| Thử Thách Chiến Đấu | Những người điểm thấp nhất phải đấu với nhau |

**Thuộc tính:**
- `id`: Mã định danh
- `name`: Tên sự kiện
- `type`: "reward" | "penalty" | "neutral"
- `effect`: Hiệu ứng
- `description`: Mô tả chi tiết

### 2.6 Resources
| Resource | Số lượng | Mô tả |
|----------|----------|-------|
| Đùi gà (Chicken Leg Token) | 30 | Dùng để vào hang quái thú |
| Xúc xắc (Dice) | 6 mặt | Dùng để chiến đấu |

---

## 3. Game Board (Bản đồ)

### 3.1 Layout
- **5 Hang quái thú thường**: Mỗi hang chứa 1 quái thú, yêu cầu 1-5 đùi gà để vào
- **4 Hang Siêu Thú Cổ Đại**: Ở 4 góc bản đồ, yêu cầu thẻ quái thú theo hệ để vào
- **Ô điểm chiến công**: Track điểm từ 0 đến MAX

### 3.2 Small Caves (5 hang nhỏ)
| Hang | Chi phí (Đùi gà) | Điểm chiến công | Ghi chú |
|------|------------------|-----------------|---------|
| Cave 1 | 1 | 1 | Dễ nhất |
| Cave 2 | 2 | 2 | |
| Cave 3 | 3 | 3 | |
| Cave 4 | 4 | 4 | |
| Cave 5 | 5 | 5 | Khó nhất, power bonus cao nhất |

### 3.3 Ancient Beast Caves (4 hang Siêu Thú)
| Hang | Yêu cầu vào | Điểm chiến công |
|------|-------------|-----------------|
| Hang Cáo Lửa 9 Đuôi | 2 Lửa + 1 bất kỳ | 3 |
| Hang Bạch Tuộc Bất Mãn | 2 Nước + 1 bất kỳ | 3 |
| Hang Người Đá Yêu Cây | 2 Đất + 1 bất kỳ | 3 |
| Hang Vẹt 4 Chân | 2 Khí + 1 bất kỳ | 3 |

### 3.4 Cave Properties
| Thuộc tính | Mô tả |
|------------|-------|
| `id` | Mã định danh hang |
| `cost` | Số đùi gà cần bỏ ra (1-5) |
| `victoryPoints` | Điểm chiến công khi thắng |
| `monster` | Quái thú hiện tại trong hang |
| `type` | "small" hoặc "ancient" |

---

## 4. Gameplay Flow

### 4.1 Game Setup (Khởi tạo)
1. Hiển thị bản đồ game
2. Mỗi người chơi chọn 1 nhân vật (cung hoàng đạo)
3. Đặt 4 Siêu Thú Cổ Đại vào 4 góc
4. Xáo trộn các bộ thẻ (quái thú, bảo bối, sự kiện)
5. Phát cho mỗi người: **3 đùi gà + 3 thẻ bảo bối**
6. Đặt token người chơi tại ô điểm 0
7. Rút 5 thẻ quái thú đặt vào 5 cửa hang (ngửa)
8. Roll dice để chọn người đi đầu tiên
9. Bắt đầu Ngày 1

### 4.2 Round Structure (Cấu trúc mỗi vòng/ngày)

#### Phase 1: Nhận thưởng đầu ngày
- Mỗi người chơi nhận: **+1 đùi gà, +1 thẻ bảo bối**
- *(Bỏ qua ngày đầu tiên vì đã nhận khi setup)*

#### Phase 2: Kích hoạt sự kiện
- Người chơi đầu tiên rút 1 thẻ sự kiện
- Đọc và áp dụng hiệu ứng cho tất cả người chơi

#### Phase 3: Lượt chơi (theo chiều kim đồng hồ)
Mỗi người chơi có thể thực hiện:

**Option A: Thu phục quái thú thường**
1. Chọn 1 hang quái thú
2. Trả số đùi gà tương ứng (1-3)
3. Chiến đấu:
   - Người chơi roll dice
   - Quái thú roll dice (người bên phải roll thay)
   - **Sức mạnh người chơi** = Dice + Thẻ bảo bối + Kỹ năng nhân vật
   - **Sức mạnh quái thú** = Dice + Power base của quái thú
   - Nếu **Người chơi >= Quái thú** → Thắng
4. Nếu thắng:
   - Nhận điểm chiến công (ghi trên cửa hang)
   - Nhận thẻ quái thú (để đổi Siêu Thú sau)
   - Nhận phần thưởng theo thuộc tính quái thú
5. Rút thẻ quái thú mới bổ sung vào hang trống

**Option B: Thu phục Siêu Thú Cổ Đại**
1. Nộp số thẻ quái thú theo hệ yêu cầu
2. Nhận Siêu Thú + điểm chiến công + phần thưởng
3. *Giới hạn: Mỗi lượt chỉ thu phục được 1 Siêu Thú*

**Option C: Bỏ lượt**
- Không làm gì

#### Phase 4: Kết thúc lượt
- Di chuyển token đến ô điểm chiến công tương ứng
- Chuyển sang người tiếp theo

#### Phase 5: Kết thúc ngày
- Khi tất cả người chơi đã đi xong
- Di chuyển đồng hồ cát sang ngày tiếp theo
- Chuyển quyền "người đầu tiên" cho người tiếp theo (theo chiều kim đồng hồ)

### 4.3 End Game
- Sau ngày 8 kết thúc
- Tính tổng điểm chiến công
- Kiểm tra điều kiện thua chung
- Công bố người thắng

### 4.4 Detailed Gameplay Flow Logic (Technical)

#### 4.4.1 Game State Machine
```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME STATES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [MENU] ──► [CHARACTER_SELECT] ──► [GAME_INIT] ──► [PLAYING]    │
│                                                          │       │
│                                                          ▼       │
│                                                    [GAME_OVER]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.4.2 Round Phase State Machine
```
┌──────────────────────────────────────────────────────────────────┐
│                      PHASE TRANSITIONS                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [DAILY_REWARD] ──► [EVENT] ──► [PLAYER_TURNS] ──► [DAY_END]     │
│        │                                                 │        │
│        │ (skip day 1)                                    │        │
│        └─────────────────────────────────────────────────┘        │
│                          (next day)                               │
│                                                                   │
│  After DAY_END on day 8: ──► [GAME_OVER]                         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### 4.4.3 Player Turn Flow
```
┌──────────────────────────────────────────────────────────────────┐
│                     PLAYER TURN FLOW                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [START_TURN]                                                     │
│       │                                                           │
│       ▼                                                           │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  OPTIONAL: Use Skill (anytime skills)                    │     │
│  │  OPTIONAL: Play Instant Cards                            │     │
│  └─────────────────────────────────────────────────────────┘     │
│       │                                                           │
│       ▼                                                           │
│  [CHOOSE_ACTION] ─────┬──────────────┬──────────────┐            │
│       │               │              │              │             │
│       ▼               ▼              ▼              ▼             │
│  [ENTER_CAVE]   [CAPTURE_BEAST]   [USE_SKILL]   [PASS]          │
│       │               │              │              │             │
│       ▼               ▼              ▼              │             │
│  [COMBAT]        [SACRIFICE]    [APPLY_EFFECT]     │             │
│       │               │              │              │             │
│       ▼               ▼              ▼              │             │
│  [RESOLVE]       [GET_REWARDS]  [MARK_USED]        │             │
│       │               │              │              │             │
│       └───────────────┴──────────────┴──────────────┘             │
│                       │                                           │
│                       ▼                                           │
│                 [END_TURN] ──► Next Player or DAY_END            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### 4.4.4 Combat Resolution Flow
```
┌──────────────────────────────────────────────────────────────────┐
│                     COMBAT FLOW                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. [PAY_COST]                                                   │
│     └─► Deduct chicken legs from player                          │
│                                                                   │
│  2. [PLAYER_ROLL]                                                │
│     └─► Roll dice (1-6)                                          │
│     └─► CHECK: Aries skill (even = auto-win)                     │
│     └─► CHECK: Aquarius skill (can flip 1↔6, 2↔5, 3↔4)          │
│     └─► OPTIONAL: Use dice modification cards (Bùa Số 1-6)       │
│     └─► OPTIONAL: Taurus skill (pay 2 legs, set any value)       │
│                                                                   │
│  3. [CALCULATE_PLAYER_POWER]                                     │
│     └─► Base = Modified Dice Result                              │
│     └─► + Permanent Power (from Fire monsters)                   │
│     └─► + Ancient Beast bonuses                                  │
│     └─► + Card effects (Kiếm/Khiên/Trượng auto-win)             │
│     └─► + Skill effects (Libra: +1 per Fire in caves)           │
│     └─► + Ally support (Cancer skill)                            │
│                                                                   │
│  4. [MONSTER_ROLL]                                               │
│     └─► Roll dice (1-6)                                          │
│                                                                   │
│  5. [CALCULATE_MONSTER_POWER]                                    │
│     └─► Base = Dice Result                                       │
│     └─► + Monster base power (+2, +3, or +4)                     │
│     └─► - Virgo skill effect (removes base power)                │
│                                                                   │
│  6. [COMPARE_POWERS]                                             │
│     └─► IF Player >= Monster → WIN                               │
│     └─► IF Player < Monster → LOSE                               │
│     └─► CHECK: Auto-win conditions override comparison           │
│                                                                   │
│  7. [APPLY_RESULT]                                               │
│     └─► WIN:                                                     │
│         ├─► Add Victory Points (cave value)                      │
│         ├─► Capture Monster card                                 │
│         ├─► Apply Element Reward:                                │
│         │   ├─► Fire: +1 Permanent Power                         │
│         │   ├─► Water: +1 Treasure Card                          │
│         │   ├─► Earth: +1 Chicken Leg                            │
│         │   └─► Air: +1 Victory Point                            │
│         └─► Refill cave with new monster                         │
│     └─► LOSE: Nothing happens                                    │
│                                                                   │
│  8. [END_COMBAT]                                                 │
│     └─► Clear combat state                                       │
│     └─► Return to player turn                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### 4.4.5 Card/Skill Timing Rules
```
┌──────────────────────────────────────────────────────────────────┐
│                    TIMING WINDOWS                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  INSTANT CARDS (Blue) - Can be played:                           │
│  ├─► During any player's turn                                    │
│  ├─► During combat (before resolution)                           │
│  ├─► In response to other cards/effects                          │
│  └─► During event phase                                          │
│                                                                   │
│  ACTION CARDS (Red) - Can only be played:                        │
│  └─► During your own turn, as part of your action                │
│                                                                   │
│  ANYTIME SKILLS - Can be used:                                   │
│  ├─► Gemini: When opponent plays treasure card                   │
│  ├─► Cancer: When another player is in combat                    │
│  ├─► Leo: During event phase                                     │
│  └─► Aquarius: After any dice roll                               │
│                                                                   │
│  IN-TURN SKILLS - Can only be used:                              │
│  ├─► Aries: Passive, activates on even dice roll                 │
│  ├─► Taurus: After rolling dice in combat                        │
│  ├─► Virgo: During combat, before resolution                     │
│  ├─► Libra: During combat, before resolution                     │
│  ├─► Scorpio: During your turn                                   │
│  ├─► Sagittarius: During combat, before resolution               │
│  ├─► Capricorn: During your turn                                 │
│  └─► Pisces: During your turn                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### 4.4.6 Ancient Beast Capture Flow
```
┌──────────────────────────────────────────────────────────────────┐
│                ANCIENT BEAST CAPTURE FLOW                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. [CHECK_REQUIREMENTS]                                         │
│     └─► Verify player has:                                       │
│         ├─► 2 monsters of required element                       │
│         └─► 1 monster of any element                             │
│                                                                   │
│  2. [SELECT_MONSTERS]                                            │
│     └─► Player chooses exactly 3 monsters to sacrifice           │
│     └─► Must include 2 of required element                       │
│                                                                   │
│  3. [SACRIFICE_MONSTERS]                                         │
│     └─► Remove 3 selected monsters from player                   │
│     └─► Discard to monster discard pile                          │
│                                                                   │
│  4. [CAPTURE_BEAST]                                              │
│     └─► Remove beast from board                                  │
│     └─► Add beast to player's collection                         │
│                                                                   │
│  5. [APPLY_REWARDS]                                              │
│     └─► Victory Points: +3                                       │
│     └─► Immediate Reward (varies by beast):                      │
│         ├─► Cáo Lửa: +2 Permanent Power                          │
│         ├─► Bạch Tuộc: +2 Treasure Cards                         │
│         ├─► Người Đá: +2 Chicken Legs                            │
│         └─► Vẹt 4 Chân: +2 Victory Points                        │
│                                                                   │
│  6. [DAILY_BONUS_ACTIVE]                                         │
│     └─► From next day, beast provides daily bonus:               │
│         ├─► Cáo Lửa: +1 Power per combat                         │
│         ├─► Bạch Tuộc: +1 Treasure Card per day                  │
│         ├─► Người Đá: +1 Chicken Leg per day                     │
│         └─► Vẹt 4 Chân: +1 Victory Point per day                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### 4.4.7 Event Resolution Flow
```
┌──────────────────────────────────────────────────────────────────┐
│                   EVENT RESOLUTION FLOW                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. [DRAW_EVENT]                                                 │
│     └─► First player draws from event deck                       │
│     └─► If deck empty, reshuffle discard pile                    │
│                                                                   │
│  2. [CHECK_BLOCK]                                                │
│     └─► Any player may use "Kính Mắt Thờ Ơ" to block             │
│     └─► If blocked, skip to step 5                               │
│                                                                   │
│  3. [CHECK_LEO_SKILL]                                            │
│     └─► Leo player may redirect event to single target           │
│                                                                   │
│  4. [EXECUTE_EFFECT]                                             │
│     └─► Based on event type:                                     │
│         ├─► REWARD: Apply positive effect                        │
│         ├─► PENALTY: Apply negative effect                       │
│         └─► NEUTRAL: Apply varied effect                         │
│     └─► May require dice rolls                                   │
│     └─► May require player interaction                           │
│                                                                   │
│  5. [DISCARD_EVENT]                                              │
│     └─► Move event card to discard pile                          │
│                                                                   │
│  6. [CONTINUE_TO_PLAYER_TURNS]                                   │
│     └─► Phase transitions to PLAYER_TURNS                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### 4.4.8 AI Decision Flow
```
┌──────────────────────────────────────────────────────────────────┐
│                     AI DECISION FLOW                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. [EVALUATE_BEAST_CAPTURE]                    Priority: HIGH   │
│     └─► Check if can capture any ancient beast                   │
│     └─► If yes → Select optimal monsters to sacrifice            │
│     └─► Execute capture                                          │
│                                                                   │
│  2. [EVALUATE_CAVES]                            Priority: MEDIUM │
│     └─► For each affordable cave:                                │
│         ├─► Calculate win probability                            │
│         ├─► Score = VP * 1.5 + WinProb * 5 + ElementValue        │
│         └─► Subtract cost penalty                                │
│     └─► If best score > threshold → Enter cave                   │
│                                                                   │
│  3. [EVALUATE_SKILL_USE]                        Priority: LOW    │
│     └─► Check if skill provides benefit                          │
│     └─► Weighted by difficulty level                             │
│     └─► If beneficial → Use skill                                │
│                                                                   │
│  4. [DEFAULT_ACTION]                                             │
│     └─► Pass turn                                                │
│                                                                   │
│  DIFFICULTY WEIGHTS:                                             │
│  ├─► Easy:   { risk: 0.3, skill: 0.2, card: 0.3 }               │
│  ├─► Medium: { risk: 0.5, skill: 0.5, card: 0.5 }               │
│  └─► Hard:   { risk: 0.7, skill: 0.8, card: 0.7 }               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### 4.4.9 Win Probability Calculation
```
Formula:
  avgPlayerPower = 3.5 + permanentPower + bonuses
  avgMonsterPower = 3.5 + monsterBasePower
  winProbability = clamp(0.5 + (avgPlayerPower - avgMonsterPower) * 0.15, 0, 1)

Example:
  Player has +2 permanent power, Monster has +3 base power
  avgPlayer = 3.5 + 2 = 5.5
  avgMonster = 3.5 + 3 = 6.5
  winProb = 0.5 + (5.5 - 6.5) * 0.15 = 0.5 - 0.15 = 0.35 (35%)
```

#### 4.4.10 Game End Conditions
```
┌──────────────────────────────────────────────────────────────────┐
│                    GAME END CONDITIONS                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TRIGGER: Day 8 ends (DAY_END phase completes)                   │
│                                                                   │
│  CHECK 1: Ancient Beast Capture                                  │
│  └─► IF no player captured any ancient beast:                    │
│      └─► RESULT: Collective Loss (Galaxy destroyed)              │
│                                                                   │
│  CHECK 2: Victory Point Comparison                               │
│  └─► Sort players by Victory Points (descending)                 │
│  └─► IF unique highest → WINNER                                  │
│  └─► IF tie → Use tiebreakers                                    │
│                                                                   │
│  TIEBREAKER ORDER:                                               │
│  1. Most captured monsters                                       │
│  2. Most chicken legs                                            │
│  3. First player in turn order                                   │
│                                                                   │
│  FINAL: Announce winner and display final scores                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Technical Requirements

### 5.1 Tech Stack
- **Platform**: Web Browser
- **Language**: JavaScript (Vanilla JS hoặc framework như React/Vue)
- **Rendering**: HTML5 Canvas hoặc DOM-based
- **Art Style**: 2D Cartoon
- **State Management**: TBD (có thể dùng Redux, Zustand, hoặc custom)

### 5.2 Game Modes
| Mode | Số người chơi | Mô tả | Priority |
|------|---------------|-------|----------|
| Single Player | 1 | Chơi với AI | ⭐ High |
| Local Multiplayer | 2-6 | Hot-seat trên cùng máy | ⭐ High |
| Online Multiplayer | 2-6 | Qua mạng | 🔮 Future |

### 5.3 AI Requirements
- AI đối thủ cho chế độ Single Player
- Các mức độ khó: Easy, Medium, Hard (optional)
- AI cần biết:
  - Chọn hang nào để vào
  - Khi nào dùng thẻ bảo bối
  - Khi nào thu phục Siêu Thú Cổ Đại
  - Khi nào sử dụng kỹ năng nhân vật

### 5.3 Core Features
- [ ] Game board display
- [ ] Character selection screen
- [ ] Dice rolling animation
- [ ] Card management (hand, deck, discard)
- [ ] Turn-based system
- [ ] Combat system
- [ ] Score tracking
- [ ] Win/Lose condition checking
- [ ] Save/Load game (optional)

### 5.4 UI Components
- [ ] Main menu
- [ ] Game board view
- [ ] Player info panel (đùi gà, thẻ bảo bối, điểm)
- [ ] Card detail popup
- [ ] Dice rolling modal
- [ ] Event notification
- [ ] Victory/Defeat screen

---

## 6. Assets Needed

> **Note**: Sẽ tự tạo sample/placeholder assets trước, sau đó thay thế bằng assets chính thức.

### 6.1 Graphics (2D Cartoon Style)
| Asset | Số lượng | Trạng thái |
|-------|----------|------------|
| Game board background | 1 | ⏳ Cần tạo placeholder |
| Character illustrations | 12 | ⏳ Cần tạo placeholder |
| Ancient Super Beast illustrations | 4 | ⏳ Cần tạo placeholder |
| Monster card illustrations | 38 | ⏳ Cần tạo placeholder |
| Treasure card illustrations | 48 | ⏳ Cần tạo placeholder |
| Event card illustrations | 22 | ⏳ Cần tạo placeholder |
| UI elements (buttons, panels, icons) | ~20 | ⏳ Cần tạo placeholder |
| Dice sprites | 6 | ⏳ Cần tạo placeholder |
| Chicken leg token sprite | 1 | ⏳ Cần tạo placeholder |

### 6.2 Audio (Optional - Phase 5)
| Asset | Trạng thái |
|-------|------------|
| Background music | 🔮 Future |
| Dice roll sound | 🔮 Future |
| Card flip sound | 🔮 Future |
| Victory/Defeat sound | 🔮 Future |
| Button click sound | 🔮 Future |

---

## 7. Data Status

Trạng thái dữ liệu game:
1. ~~Danh sách đầy đủ 12 kỹ năng nhân vật~~ ✅ DONE
2. ~~Danh sách 38 quái thú (tên, hệ, power, reward)~~ ✅ DONE
3. ~~Danh sách 48 thẻ bảo bối (tên, loại, effect)~~ ✅ DONE
4. ~~Danh sách 22 thẻ sự kiện (tên, effect)~~ ✅ DONE
5. ~~Yêu cầu cụ thể để thu phục mỗi Siêu Thú Cổ Đại~~ ✅ DONE
6. ~~Điểm chiến công của mỗi hang~~ ✅ DONE
7. ~~Phần thưởng khi thu phục quái thú/siêu thú~~ ✅ DONE

**All game data has been collected!** Ready for implementation.

---

## 8. Development Phases

### Phase 1: Core Engine
- Game state management
- Turn system
- Dice system

### Phase 2: Basic Gameplay
- Character selection
- Monster combat
- Resource management (đùi gà)

### Phase 3: Cards System
- Treasure cards
- Event cards
- Monster cards

### Phase 4: Complete Features
- Ancient Super Beast capture
- Victory/Defeat conditions
- Score tracking

### Phase 5: Polish
- UI/UX improvements
- Animations
- Sound effects

---

## 9. Project Decisions ✅

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| 1 | AI cho single player? | ✅ Cần - Implement AI opponent |
| 2 | Online multiplayer? | Local first (mở rộng sau) |
| 3 | Art style? | 2D Cartoon |
| 4 | Target platform? | Web Browser |
| 5 | Assets hình ảnh? | Tự tạo sample placeholder trước |
