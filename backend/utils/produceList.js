// Canonical produce list — English names + Hindi transliterations + Devanagari
// Used for tag extraction: loop and check if message includes term
const PRODUCE_LIST = [
  // Tomato
  'tomato', 'tomatoes', 'tamatar', 'टमाटर',
  // Onion
  'onion', 'onions', 'pyaz', 'pyaaz', 'प्याज',
  // Potato
  'potato', 'potatoes', 'aloo', 'alu', 'आलू',
  // Brinjal / Eggplant
  'brinjal', 'eggplant', 'baingan', 'baigan', 'बैंगन',
  // Okra / Lady Finger
  'okra', 'ladyfinger', 'lady finger', 'bhindi', 'भिंडी',
  // Cauliflower
  'cauliflower', 'gobi', 'gobhi', 'फूलगोभी',
  // Cabbage
  'cabbage', 'patta gobi', 'patta gobhi', 'पत्तागोभी',
  // Spinach
  'spinach', 'palak', 'पालक',
  // Garlic
  'garlic', 'lahsun', 'लहसुन',
  // Ginger
  'ginger', 'adrak', 'अदरक',
  // Lemon
  'lemon', 'nimbu', 'नींबू',
  // Mango
  'mango', 'mangoes', 'aam', 'आम',
  // Banana
  'banana', 'bananas', 'kela', 'केला',
  // Papaya
  'papaya', 'papita', 'पपीता',
  // Guava
  'guava', 'amrud', 'अमरूद',
  // Watermelon
  'watermelon', 'tarbooj', 'तरबूज',
  // Pumpkin
  'pumpkin', 'kaddu', 'कद्दू',
  // Carrot
  'carrot', 'carrots', 'gajar', 'गाजर',
  // Radish
  'radish', 'mooli', 'मूली',
  // Corn / Maize
  'corn', 'maize', 'makka', 'makki', 'मक्का',
  // Peas
  'peas', 'matar', 'मटर',
  // Cucumber
  'cucumber', 'kheera', 'khira', 'खीरा',
  // Bitter Gourd
  'bitter gourd', 'karela', 'करेला',
  // Bottle Gourd
  'bottle gourd', 'lauki', 'doodhi', 'लौकी',
  // Ridge Gourd
  'ridge gourd', 'turai', 'torai', 'तुरई',
  // Cluster Beans
  'cluster beans', 'guar', 'gawar', 'ग्वार',
  // Coriander
  'coriander', 'dhania', 'धनिया',
  // Green chilli
  'green chilli', 'hari mirch', 'हरी मिर्च',
  // Capsicum
  'capsicum', 'shimla mirch', 'शिमला मिर्च',
  // Sweet potato
  'sweet potato', 'shakarkandi', 'शकरकंदी',
  // Mushroom
  'mushroom', 'khumb', 'कुम्भ',
  // Pomegranate
  'pomegranate', 'anar', 'अनार',
  // Grapes
  'grapes', 'angoor', 'अंगूर',
  // Orange
  'orange', 'oranges', 'santra', 'संतरा',
  // Apple
  'apple', 'apples', 'seb', 'सेब',
  // Sugarcane
  'sugarcane', 'ganna', 'गन्ना',
];

/**
 * Extract produce tags from a message string.
 * Returns deduplicated array of matched produce terms (English canonical names).
 */
function extractProduce(message) {
  if (!message) return [];
  const lower = message.toLowerCase();
  const found = new Set();

  PRODUCE_LIST.forEach((term) => {
    if (lower.includes(term.toLowerCase())) {
      // Store normalized (lowercase, trimmed) version
      found.add(term.toLowerCase().trim());
    }
  });

  return Array.from(found);
}

module.exports = { PRODUCE_LIST, extractProduce };
