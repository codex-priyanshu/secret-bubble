/**
 * Advanced AI Privacy & Intimacy Smart Detector Engine
 * Comprehensive multi-lingual coverage: English, Hindi, Hinglish & Slang
 */

export const SENSITIVITY_CATEGORIES = {
  ADULT_INTIMACY: 'Adult & Physical Intimacy 🔞',
  ROMANCE_FEELINGS: 'Romance & Feelings ❤️',
  SECRETS_CONFIDENTIAL: 'Secrets & Confidential 🔒',
  FINANCIAL_CREDENTIALS: 'Financial & Credentials 🔑'
};

const SENSITIVITY_RULES = [
  // 1. Adult & Physical Intimacy (Sex, physical relations, explicit/intimate body talks)
  {
    category: SENSITIVITY_CATEGORIES.ADULT_INTIMACY,
    key: 'adult_intimacy',
    confidence: 'high',
    patterns: [
      /\b(sex|sexy|sexual|sax|sexx|sux|intercourse|nude|nudes|naked|horny|orgasm|erotic|sensual|make love|making love|foreplay|condom|fetish|strip|boobs|breast|chest|butt|ass|hips|groin|lingerie|underwear|bra|panties|wet|threesome|lust|lusty)\b/i,
      /\b(sambandh|sharirik|suhagraat|bistar|chudai|chudaai|bina kapde|kapde utaro|badan|chhuo|touch me|touch you|bister|kamuk|choli|jism|pyasa|pyasi|tight hug|french kiss|lip kiss|neck kiss|bite|bed pe|room lock|physical relation|intimate relation)\b/i,
      /\b(send nudes|photo bhejo bina|show body|body photo|shareer|hot pic|hot photo|sexy pic)\b/i
    ]
  },
  // 2. Romance, Emotions & Feelings
  {
    category: SENSITIVITY_CATEGORIES.ROMANCE_FEELINGS,
    key: 'romance_feelings',
    confidence: 'high',
    patterns: [
      /\b(love|pyar|pyaar|ishq|mohabbat|dil|feelings?|crush|like you|pyaari|khubsurat|beautiful|sundar|jaan|baby|babu|shona|sweetheart|darling|miss you|yaad aa rahi|romantic|relationship)\b/i,
      /\b(tumse pyar|dil ki baat|tum bohot|meri jaan|i adore you|fall in love|in love with|cuddle|hugs?|kiss)\b/i
    ]
  },
  // 3. Secrets & Confidential info
  {
    category: SENSITIVITY_CATEGORIES.SECRETS_CONFIDENTIAL,
    key: 'secrets_confidential',
    confidence: 'high',
    patterns: [
      /\b(secret|kisi ko mat|kisi ko nahi|mat batana|chupana|hide|confidential|don\'t tell|dont tell|keep it private|sirf hamare|private baat)\b/i,
      /\b(top secret|personal baat|kisi se share mat|leak mat karna|kisi ko pata na chale)\b/i
    ]
  },
  // 4. Financial & Passwords
  {
    category: SENSITIVITY_CATEGORIES.FINANCIAL_CREDENTIALS,
    key: 'financial_credentials',
    confidence: 'high',
    patterns: [
      /\b(password|pin|otp|cvv|account number|debit card|credit card|upi pin|bank balance|net banking|creds)\b/i,
      /\b(\d{4,6}\s*(otp|pin)|my password is)\b/i
    ]
  }
];

export function analyzeMessageSensitivity(text, enabledCategories = {}) {
  if (!text || typeof text !== 'string') {
    return { isSensitive: false, category: 'General', confidence: 'none' };
  }

  const cleanText = text.toLowerCase();

  for (const rule of SENSITIVITY_RULES) {
    // Check if this specific category is enabled in user settings (default true)
    if (enabledCategories[rule.key] === false) {
      continue;
    }

    for (const pattern of rule.patterns) {
      const match = cleanText.match(pattern);
      if (match) {
        return {
          isSensitive: true,
          category: rule.category,
          key: rule.key,
          confidence: rule.confidence,
          matchedKeyword: match[0],
          reason: `Auto-detected ${rule.category}`
        };
      }
    }
  }

  return {
    isSensitive: false,
    category: 'General',
    confidence: 'none'
  };
}