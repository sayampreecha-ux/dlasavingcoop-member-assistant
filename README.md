# AI ผู้ช่วยสมาชิก สอ.อปท.

เว็บไซต์ผู้ช่วยสมาชิกแบบ Static สำหรับพาสมาชิกจาก “คำถาม” ไปจนจบกระบวนการ โดยอ้างอิงข้อมูลทางการของสหกรณ์

- GitHub Pages
- ไม่ใช้ Netlify
- ไม่ใช้ AI API
- ข้อมูลเฉพาะสมาชิกส่งต่อเจ้าหน้าที่
- ไม่เก็บรหัสผ่านหรือ OTP

## Production Lock

- Repository จริง: `sayampreecha-ux/dlasavingcoop-member-assistant`
- Source ที่แก้ไข: `main`
- Production mirror: `gh-pages`
- Production URL: `https://sayampreecha-ux.github.io/dlasavingcoop-member-assistant/`
- ห้ามแก้ `backup/*` หรือ `gh-pages` โดยตรงเพื่อพัฒนาฟีเจอร์
- ทุกครั้งต้อง: แก้ `main` → regression ผ่าน → สำรอง production เดิม → sync `index.html` ไป `gh-pages` เพียงครั้งเดียว → ตรวจ version/hash
- หาก `main` กับ `gh-pages` ไม่ตรง ห้ามรายงานว่า production เป็นรุ่นล่าสุด

## Pilot Freeze — v3.1.0

สถานะ: **FROZEN FOR PILOT**

- Pilot version: `3.1.0-pilot-pages`
- Pilot reference branch: `pilot/v3.1.0`
- ช่วง Pilot ให้แก้เฉพาะ:
  - ข้อมูลผิด/ลิงก์เสีย/ข้อมูลทางการเปลี่ยน
  - บั๊กที่ทำให้สมาชิกทำรายการไม่ได้
  - Privacy/Security issue
  - Critical UX issue ที่ขัดขวางการใช้งานจริง
- ห้ามเพิ่ม feature ใหม่, เปลี่ยนโครงหน้าใหญ่, ต่อ backend/AI API/LINE API หรือเปลี่ยนสถาปัตยกรรมระหว่าง Pilot โดยไม่มีเหตุจำเป็น
- ทุกการแก้ระหว่าง Pilot ต้องเพิ่ม regression case ที่ reproduces ปัญหาก่อน
- เก็บ feedback สมาชิกจริงไว้เป็น backlog สำหรับรุ่นหลัง Pilot
- `pilot/v3.1.0` ใช้เป็น snapshot อ้างอิง ห้ามพัฒนา feature ต่อบน branch นี้

### Pilot UX baseline
- โทนแบรนด์: ส้ม–เขียว–ทอง–ขาว
- มีตราสหกรณ์ใน header
- Mobile-first
- Answer First
- ขั้นตอน/รายละเอียดใช้ progressive disclosure
- รักษา 8 บริการหลัก + 10 บริการเพิ่มเติม
- คง Privacy Gate / Freshness Gate / Transaction Completion Contract

## Member Service Coverage v3

หน้าแรกใช้ 8 บริการหลัก:
- หุ้น
- เงินกู้
- ชำระเงิน
- เงินฝาก
- สมาชิก
- สวัสดิการ
- ฌาปนกิจ
- ติดตามผล

บริการเพิ่มเติมครอบคลุม:
- หนังสือยืนยันยอด
- ผู้ค้ำประกัน
- ปันผล/เฉลี่ยคืน
- ประกัน
- ปรับโครงสร้าง/ประนอมหนี้
- ผู้รับโอนประโยชน์
- เกษียณ/บำนาญ
- แบบฟอร์ม
- ข้อมูลเฉพาะสมาชิก
- ข่าว/ประกาศ

## Knowledge Governance

ลำดับอำนาจข้อมูล:
1. ข้อบังคับ/ระเบียบปัจจุบัน
2. ประกาศ/หลักเกณฑ์ล่าสุด
3. แบบฟอร์มทางการ
4. ผลอนุมัติ/ประกาศรายรอบ
5. หน้าติดต่อปัจจุบัน

กระดานถามตอบใช้เพื่อหา “คำถามที่สมาชิกถามบ่อย” เท่านั้น ไม่ใช้เป็นฐานกฎหรืออัตราปัจจุบัน

งานที่เปลี่ยนตามรอบ เช่น ซื้อหุ้นเพิ่ม ผลอนุมัติ ประกัน ปันผล ประชุมใหญ่ ต้องแสดง Freshness status และพาไปตรวจประกาศล่าสุด

## Transaction Completion Contract

ธุรกรรมต้องมีอย่างน้อย:
- หลักเกณฑ์/ระเบียบ/ประกาศ/แบบฟอร์มทางการ
- ขั้นตอน
- จุดที่ถือว่ากระบวนการเสร็จ
- เจ้าหน้าที่/ช่องทางติดตาม

## Regression test

รันหลังแก้ Knowledge Base / Intent Router / UI / ช่องทางติดต่อ:

```bash
node tests/regression.mjs
```

ชุด v3 ครอบคลุม intent หลัก, natural-language routing, คำพิมพ์ผิด, privacy handoff, Transaction Completion, Freshness, ปุ่มหน้าแรก, source-registry และ stale contact/link guards
