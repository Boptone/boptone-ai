/**
 * Localized email templates for Boptone
 * Supports 10 languages: en, es, pt, fr, de, ja, ko, zh, hi, ar
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

type LanguageCode = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'ja' | 'ko' | 'zh' | 'hi' | 'ar';

/**
 * Email template translations
 */
const EMAIL_TRANSLATIONS: Record<LanguageCode, {
  verification: {
    subject: string;
    greeting: string;
    body: string;
    cta: string;
    footer: string;
  };
  passwordReset: {
    subject: string;
    greeting: string;
    body: string;
    cta: string;
    footer: string;
  };
  welcome: {
    subject: string;
    greeting: string;
    body: string;
    cta: string;
    footer: string;
  };
}> = {
  en: {
    verification: {
      subject: 'Verify your Boptone account',
      greeting: 'Welcome to Boptone!',
      body: 'Please verify your email address to complete your registration. Your verification code is:',
      cta: 'Verify Email',
      footer: 'If you didn\'t create this account, please ignore this email.',
    },
    passwordReset: {
      subject: 'Reset your Boptone password',
      greeting: 'Password Reset Request',
      body: 'We received a request to reset your password. Your reset code is:',
      cta: 'Reset Password',
      footer: 'If you didn\'t request this, please ignore this email.',
    },
    welcome: {
      subject: 'Welcome to Boptone - Create Your Tone',
      greeting: 'Welcome to Boptone!',
      body: 'You\'re now part of the complete operating system for artists. Start uploading your music, connecting with fans, and building your career.',
      cta: 'Get Started',
      footer: 'Need help? Visit our support center or reply to this email.',
    },
  },
  es: {
    verification: {
      subject: 'Verifica tu cuenta de Boptone',
      greeting: '¡Bienvenido a Boptone!',
      body: 'Por favor verifica tu dirección de correo electrónico para completar tu registro. Tu código de verificación es:',
      cta: 'Verificar Correo',
      footer: 'Si no creaste esta cuenta, ignora este correo.',
    },
    passwordReset: {
      subject: 'Restablece tu contraseña de Boptone',
      greeting: 'Solicitud de Restablecimiento de Contraseña',
      body: 'Recibimos una solicitud para restablecer tu contraseña. Tu código de restablecimiento es:',
      cta: 'Restablecer Contraseña',
      footer: 'Si no solicitaste esto, ignora este correo.',
    },
    welcome: {
      subject: 'Bienvenido a Boptone - Crea Tu Tono',
      greeting: '¡Bienvenido a Boptone!',
      body: 'Ahora eres parte del sistema operativo completo para artistas. Comienza a subir tu música, conectar con fans y construir tu carrera.',
      cta: 'Comenzar',
      footer: '¿Necesitas ayuda? Visita nuestro centro de soporte o responde a este correo.',
    },
  },
  pt: {
    verification: {
      subject: 'Verifique sua conta Boptone',
      greeting: 'Bem-vindo ao Boptone!',
      body: 'Por favor, verifique seu endereço de e-mail para completar seu registro. Seu código de verificação é:',
      cta: 'Verificar E-mail',
      footer: 'Se você não criou esta conta, ignore este e-mail.',
    },
    passwordReset: {
      subject: 'Redefina sua senha do Boptone',
      greeting: 'Solicitação de Redefinição de Senha',
      body: 'Recebemos uma solicitação para redefinir sua senha. Seu código de redefinição é:',
      cta: 'Redefinir Senha',
      footer: 'Se você não solicitou isso, ignore este e-mail.',
    },
    welcome: {
      subject: 'Bem-vindo ao Boptone - Crie Seu Tom',
      greeting: 'Bem-vindo ao Boptone!',
      body: 'Você agora faz parte do sistema operacional completo para artistas. Comece a enviar sua música, conectar-se com fãs e construir sua carreira.',
      cta: 'Começar',
      footer: 'Precisa de ajuda? Visite nosso centro de suporte ou responda a este e-mail.',
    },
  },
  fr: {
    verification: {
      subject: 'Vérifiez votre compte Boptone',
      greeting: 'Bienvenue sur Boptone !',
      body: 'Veuillez vérifier votre adresse e-mail pour compléter votre inscription. Votre code de vérification est :',
      cta: 'Vérifier l\'E-mail',
      footer: 'Si vous n\'avez pas créé ce compte, ignorez cet e-mail.',
    },
    passwordReset: {
      subject: 'Réinitialisez votre mot de passe Boptone',
      greeting: 'Demande de Réinitialisation de Mot de Passe',
      body: 'Nous avons reçu une demande de réinitialisation de votre mot de passe. Votre code de réinitialisation est :',
      cta: 'Réinitialiser le Mot de Passe',
      footer: 'Si vous n\'avez pas demandé cela, ignorez cet e-mail.',
    },
    welcome: {
      subject: 'Bienvenue sur Boptone - Créez Votre Ton',
      greeting: 'Bienvenue sur Boptone !',
      body: 'Vous faites maintenant partie du système d\'exploitation complet pour les artistes. Commencez à télécharger votre musique, à vous connecter avec les fans et à construire votre carrière.',
      cta: 'Commencer',
      footer: 'Besoin d\'aide ? Visitez notre centre de support ou répondez à cet e-mail.',
    },
  },
  de: {
    verification: {
      subject: 'Verifizieren Sie Ihr Boptone-Konto',
      greeting: 'Willkommen bei Boptone!',
      body: 'Bitte verifizieren Sie Ihre E-Mail-Adresse, um Ihre Registrierung abzuschließen. Ihr Verifizierungscode lautet:',
      cta: 'E-Mail Verifizieren',
      footer: 'Wenn Sie dieses Konto nicht erstellt haben, ignorieren Sie diese E-Mail.',
    },
    passwordReset: {
      subject: 'Setzen Sie Ihr Boptone-Passwort zurück',
      greeting: 'Passwort-Zurücksetzungsanfrage',
      body: 'Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Ihr Zurücksetzungscode lautet:',
      cta: 'Passwort Zurücksetzen',
      footer: 'Wenn Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.',
    },
    welcome: {
      subject: 'Willkommen bei Boptone - Erstellen Sie Ihren Ton',
      greeting: 'Willkommen bei Boptone!',
      body: 'Sie sind jetzt Teil des vollständigen Betriebssystems für Künstler. Beginnen Sie mit dem Hochladen Ihrer Musik, dem Verbinden mit Fans und dem Aufbau Ihrer Karriere.',
      cta: 'Loslegen',
      footer: 'Benötigen Sie Hilfe? Besuchen Sie unser Support-Center oder antworten Sie auf diese E-Mail.',
    },
  },
  ja: {
    verification: {
      subject: 'Boptoneアカウントを確認してください',
      greeting: 'Boptoneへようこそ！',
      body: '登録を完了するためにメールアドレスを確認してください。確認コードは次のとおりです：',
      cta: 'メールを確認',
      footer: 'このアカウントを作成していない場合は、このメールを無視してください。',
    },
    passwordReset: {
      subject: 'Boptoneパスワードをリセット',
      greeting: 'パスワードリセットリクエスト',
      body: 'パスワードのリセットリクエストを受け取りました。リセットコードは次のとおりです：',
      cta: 'パスワードをリセット',
      footer: 'これをリクエストしていない場合は、このメールを無視してください。',
    },
    welcome: {
      subject: 'Boptoneへようこそ - あなたのトーンを作成',
      greeting: 'Boptoneへようこそ！',
      body: 'アーティスト向けの完全なオペレーティングシステムの一部になりました。音楽のアップロード、ファンとのつながり、キャリアの構築を始めましょう。',
      cta: '始める',
      footer: 'サポートが必要ですか？サポートセンターにアクセスするか、このメールに返信してください。',
    },
  },
  ko: {
    verification: {
      subject: 'Boptone 계정을 확인하세요',
      greeting: 'Boptone에 오신 것을 환영합니다!',
      body: '등록을 완료하려면 이메일 주소를 확인하세요. 확인 코드는 다음과 같습니다:',
      cta: '이메일 확인',
      footer: '이 계정을 만들지 않았다면 이 이메일을 무시하세요.',
    },
    passwordReset: {
      subject: 'Boptone 비밀번호 재설정',
      greeting: '비밀번호 재설정 요청',
      body: '비밀번호 재설정 요청을 받았습니다. 재설정 코드는 다음과 같습니다:',
      cta: '비밀번호 재설정',
      footer: '이것을 요청하지 않았다면 이 이메일을 무시하세요.',
    },
    welcome: {
      subject: 'Boptone에 오신 것을 환영합니다 - 당신의 톤을 만드세요',
      greeting: 'Boptone에 오신 것을 환영합니다!',
      body: '이제 아티스트를 위한 완전한 운영 체제의 일부입니다. 음악 업로드, 팬과의 연결, 경력 구축을 시작하세요.',
      cta: '시작하기',
      footer: '도움이 필요하신가요? 지원 센터를 방문하거나 이 이메일에 회신하세요.',
    },
  },
  zh: {
    verification: {
      subject: '验证您的Boptone账户',
      greeting: '欢迎来到Boptone！',
      body: '请验证您的电子邮件地址以完成注册。您的验证码是：',
      cta: '验证电子邮件',
      footer: '如果您没有创建此账户，请忽略此电子邮件。',
    },
    passwordReset: {
      subject: '重置您的Boptone密码',
      greeting: '密码重置请求',
      body: '我们收到了重置您密码的请求。您的重置码是：',
      cta: '重置密码',
      footer: '如果您没有请求此操作，请忽略此电子邮件。',
    },
    welcome: {
      subject: '欢迎来到Boptone - 创建您的音调',
      greeting: '欢迎来到Boptone！',
      body: '您现在是艺术家完整操作系统的一部分。开始上传您的音乐，与粉丝联系，并建立您的事业。',
      cta: '开始',
      footer: '需要帮助？访问我们的支持中心或回复此电子邮件。',
    },
  },
  hi: {
    verification: {
      subject: 'अपने Boptone खाते को सत्यापित करें',
      greeting: 'Boptone में आपका स्वागत है!',
      body: 'अपना पंजीकरण पूरा करने के लिए कृपया अपना ईमेल पता सत्यापित करें। आपका सत्यापन कोड है:',
      cta: 'ईमेल सत्यापित करें',
      footer: 'यदि आपने यह खाता नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें।',
    },
    passwordReset: {
      subject: 'अपना Boptone पासवर्ड रीसेट करें',
      greeting: 'पासवर्ड रीसेट अनुरोध',
      body: 'हमें आपका पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ। आपका रीसेट कोड है:',
      cta: 'पासवर्ड रीसेट करें',
      footer: 'यदि आपने इसका अनुरोध नहीं किया है, तो कृपया इस ईमेल को अनदेखा करें।',
    },
    welcome: {
      subject: 'Boptone में आपका स्वागत है - अपनी टोन बनाएं',
      greeting: 'Boptone में आपका स्वागत है!',
      body: 'अब आप कलाकारों के लिए पूर्ण ऑपरेटिंग सिस्टम का हिस्सा हैं। अपना संगीत अपलोड करना, प्रशंसकों से जुड़ना और अपना करियर बनाना शुरू करें।',
      cta: 'शुरू करें',
      footer: 'मदद चाहिए? हमारे सहायता केंद्र पर जाएं या इस ईमेल का जवाब दें।',
    },
  },
  ar: {
    verification: {
      subject: 'تحقق من حساب Boptone الخاص بك',
      greeting: 'مرحبًا بك في Boptone!',
      body: 'يرجى التحقق من عنوان بريدك الإلكتروني لإكمال التسجيل. رمز التحقق الخاص بك هو:',
      cta: 'تحقق من البريد الإلكتروني',
      footer: 'إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد الإلكتروني.',
    },
    passwordReset: {
      subject: 'إعادة تعيين كلمة مرور Boptone الخاصة بك',
      greeting: 'طلب إعادة تعيين كلمة المرور',
      body: 'تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك. رمز إعادة التعيين الخاص بك هو:',
      cta: 'إعادة تعيين كلمة المرور',
      footer: 'إذا لم تطلب ذلك، يرجى تجاهل هذا البريد الإلكتروني.',
    },
    welcome: {
      subject: 'مرحبًا بك في Boptone - أنشئ نغمتك',
      greeting: 'مرحبًا بك في Boptone!',
      body: 'أنت الآن جزء من نظام التشغيل الكامل للفنانين. ابدأ في تحميل موسيقاك والتواصل مع المعجبين وبناء مسيرتك المهنية.',
      cta: 'ابدأ',
      footer: 'تحتاج مساعدة؟ قم بزيارة مركز الدعم الخاص بنا أو قم بالرد على هذا البريد الإلكتروني.',
    },
  },
};

/**
 * Generate HTML email template
 */
function generateEmailHTML(params: {
  greeting: string;
  body: string;
  code?: string;
  cta: string;
  ctaUrl: string;
  footer: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boptone</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #000000;
      padding: 32px 40px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 24px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 16px;
    }
    .body {
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      margin-bottom: 24px;
    }
    .code {
      background-color: #f5f5f5;
      border: 2px solid #000000;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .code-value {
      font-size: 32px;
      font-weight: bold;
      color: #000000;
      letter-spacing: 4px;
      font-family: 'Courier New', monospace;
    }
    .cta {
      display: inline-block;
      background-color: #000000;
      color: #ffffff;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
    }
    .footer {
      font-size: 14px;
      color: #666666;
      line-height: 1.5;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
    .footer-branding {
      background-color: #f5f5f5;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BOPTONE</div>
    </div>
    <div class="content">
      <div class="greeting">${params.greeting}</div>
      <div class="body">${params.body}</div>
      ${params.code ? `
      <div class="code">
        <div class="code-value">${params.code}</div>
      </div>
      ` : ''}
      <div style="text-align: center;">
        <a href="${params.ctaUrl}" class="cta">${params.cta}</a>
      </div>
      <div class="footer">${params.footer}</div>
    </div>
    <div class="footer-branding">
      © ${new Date().getFullYear()} Boptone, Inc. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email
 */
function generateEmailText(params: {
  greeting: string;
  body: string;
  code?: string;
  cta: string;
  ctaUrl: string;
  footer: string;
}): string {
  return `
${params.greeting}

${params.body}

${params.code ? `Verification Code: ${params.code}\n\n` : ''}

${params.cta}: ${params.ctaUrl}

${params.footer}

---
© ${new Date().getFullYear()} Boptone, Inc. All rights reserved.
  `.trim();
}

/**
 * Get verification email template
 */
export function getVerificationEmail(
  code: string,
  language: LanguageCode = 'en'
): EmailTemplate {
  const t = EMAIL_TRANSLATIONS[language].verification;
  const verifyUrl = `https://boptone.com/verify?code=${code}`;

  return {
    subject: t.subject,
    html: generateEmailHTML({
      greeting: t.greeting,
      body: t.body,
      code,
      cta: t.cta,
      ctaUrl: verifyUrl,
      footer: t.footer,
    }),
    text: generateEmailText({
      greeting: t.greeting,
      body: t.body,
      code,
      cta: t.cta,
      ctaUrl: verifyUrl,
      footer: t.footer,
    }),
  };
}

/**
 * Get password reset email template
 */
export function getPasswordResetEmail(
  code: string,
  language: LanguageCode = 'en'
): EmailTemplate {
  const t = EMAIL_TRANSLATIONS[language].passwordReset;
  const resetUrl = `https://boptone.com/reset-password?code=${code}`;

  return {
    subject: t.subject,
    html: generateEmailHTML({
      greeting: t.greeting,
      body: t.body,
      code,
      cta: t.cta,
      ctaUrl: resetUrl,
      footer: t.footer,
    }),
    text: generateEmailText({
      greeting: t.greeting,
      body: t.body,
      code,
      cta: t.cta,
      ctaUrl: resetUrl,
      footer: t.footer,
    }),
  };
}

/**
 * Get welcome email template
 */
export function getWelcomeEmail(
  language: LanguageCode = 'en'
): EmailTemplate {
  const t = EMAIL_TRANSLATIONS[language].welcome;
  const dashboardUrl = 'https://boptone.com/dashboard';

  return {
    subject: t.subject,
    html: generateEmailHTML({
      greeting: t.greeting,
      body: t.body,
      cta: t.cta,
      ctaUrl: dashboardUrl,
      footer: t.footer,
    }),
    text: generateEmailText({
      greeting: t.greeting,
      body: t.body,
      cta: t.cta,
      ctaUrl: dashboardUrl,
      footer: t.footer,
    }),
  };
}
