# Discord Bot عربي (config.json)

تم تنظيم المشروع بحيث **كل أمر في ملف مستقل** داخل:
`src/commands/<category>/<command>.js`

## تشغيل
```bash
npm install
npm start
```

## إعداد
عدّل `config.json`:
- token
- clientId
- prefix
- owners

## خصائص
- كل الأوامر Prefix + Slash.
- أوامر الأونرز للأونرز فقط.
- Administrator يقدر يستخدم كل الأوامر ما عدا أوامر الأونرز.
- أمر `permission <category> <role>` لتحديد رتبة لقسم أوامر.
