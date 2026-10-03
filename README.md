# AI ผู้ช่วยสมาชิก สอ.อปท.

เว็บไซต์ผู้ช่วยสมาชิกแบบ Static สำหรับตอบคำถามพื้นฐานจากข้อมูลทางการของสหกรณ์

- GitHub Pages
- ไม่ใช้ Netlify
- ไม่ใช้ AI API
- ข้อมูลเฉพาะสมาชิกส่งต่อเจ้าหน้าที่
- ไม่เก็บรหัสผ่านหรือ OTP

Production source: `index.html`

## Regression test

รันชุดทดสอบหลักหลังแก้ Knowledge Base / Intent Router / ช่องทางติดต่อ:

```bash
node tests/regression.mjs
```

ชุดทดสอบครอบคลุม intent หลัก, คำพิมพ์ผิด, privacy handoff, ปุ่มหน้าแรก และ stale contact/link guards
