export type Translation = {
  /** Code de langue (BCP 47). */
  lang: string
  /** Nom de la langue, en français. */
  label: string
  /** « Je t'aime » dans cette langue. */
  text: string
  /** Écritures qui se lisent de droite à gauche. */
  dir?: 'rtl'
}

// Pour les langues à genre, c'est ELLE qui parle (elle appuie sur le bouton) :
// forme féminine pour celle qui parle, masculine pour celui à qui elle parle.
// Forme romantique privilégiée quand il en existe plusieurs.
export const translations: Translation[] = [
  // Europe de l'Ouest
  { lang: 'fr', label: 'Français', text: "Je t'aime" },
  { lang: 'en', label: 'Anglais', text: 'I love you' },
  { lang: 'es', label: 'Espagnol', text: 'Te amo' },
  { lang: 'pt', label: 'Portugais', text: 'Eu te amo' },
  { lang: 'it', label: 'Italien', text: 'Ti amo' },
  { lang: 'de', label: 'Allemand', text: 'Ich liebe dich' },
  { lang: 'nl', label: 'Néerlandais', text: 'Ik hou van jou' },
  { lang: 'ca', label: 'Catalan', text: "T'estimo" },
  { lang: 'gl', label: 'Galicien', text: 'Quérote' },
  { lang: 'eu', label: 'Basque', text: 'Maite zaitut' },
  { lang: 'lb', label: 'Luxembourgeois', text: 'Ech hunn dech gär' },
  { lang: 'ga', label: 'Irlandais', text: 'Tá grá agam duit' },
  { lang: 'gd', label: 'Gaélique écossais', text: 'Tha gaol agam ort' },
  { lang: 'cy', label: 'Gallois', text: "Rwy'n dy garu di" },
  { lang: 'mt', label: 'Maltais', text: 'Inħobbok' },
  { lang: 'eo', label: 'Espéranto', text: 'Mi amas vin' },

  // Europe du Nord
  { lang: 'sv', label: 'Suédois', text: 'Jag älskar dig' },
  { lang: 'no', label: 'Norvégien', text: 'Jeg elsker deg' },
  { lang: 'da', label: 'Danois', text: 'Jeg elsker dig' },
  { lang: 'is', label: 'Islandais', text: 'Ég elska þig' },
  { lang: 'fi', label: 'Finnois', text: 'Rakastan sinua' },
  { lang: 'et', label: 'Estonien', text: 'Ma armastan sind' },
  { lang: 'lv', label: 'Letton', text: 'Es tevi mīlu' },
  { lang: 'lt', label: 'Lituanien', text: 'Aš tave myliu' },

  // Europe centrale et de l'Est
  { lang: 'pl', label: 'Polonais', text: 'Kocham cię' },
  { lang: 'cs', label: 'Tchèque', text: 'Miluji tě' },
  { lang: 'sk', label: 'Slovaque', text: 'Ľúbim ťa' },
  { lang: 'hu', label: 'Hongrois', text: 'Szeretlek' },
  { lang: 'ro', label: 'Roumain', text: 'Te iubesc' },
  { lang: 'hr', label: 'Croate', text: 'Volim te' },
  { lang: 'sl', label: 'Slovène', text: 'Ljubim te' },
  { lang: 'sq', label: 'Albanais', text: 'Të dua' },
  { lang: 'el', label: 'Grec', text: "Σ'αγαπώ" },
  { lang: 'ru', label: 'Russe', text: 'Я тебя люблю' },
  { lang: 'uk', label: 'Ukrainien', text: 'Я тебе кохаю' },
  { lang: 'be', label: 'Biélorusse', text: 'Я цябе кахаю' },
  { lang: 'bg', label: 'Bulgare', text: 'Обичам те' },
  { lang: 'sr', label: 'Serbe', text: 'Волим те' },
  { lang: 'mk', label: 'Macédonien', text: 'Те сакам' },

  // Caucase, Asie centrale, Moyen-Orient
  { lang: 'hy', label: 'Arménien', text: 'Սիրում եմ քեզ' },
  { lang: 'ka', label: 'Géorgien', text: 'მიყვარხარ' },
  { lang: 'tr', label: 'Turc', text: 'Seni seviyorum' },
  { lang: 'az', label: 'Azerbaïdjanais', text: 'Səni sevirəm' },
  { lang: 'uz', label: 'Ouzbek', text: 'Seni sevaman' },
  { lang: 'kk', label: 'Kazakh', text: 'Мен сені сүйемін' },
  { lang: 'mn', label: 'Mongol', text: 'Би чамд хайртай' },
  { lang: 'ku', label: 'Kurde (kurmandji)', text: 'Ez ji te hez dikim' },
  { lang: 'ar', label: 'Arabe', text: 'أحبك', dir: 'rtl' },
  { lang: 'ar', label: 'Arabe marocain (darija)', text: 'كنبغيك', dir: 'rtl' },
  { lang: 'he', label: 'Hébreu', text: 'אני אוהבת אותך', dir: 'rtl' },
  { lang: 'fa', label: 'Persan', text: 'دوستت دارم', dir: 'rtl' },
  { lang: 'ur', label: 'Ourdou', text: 'میں تم سے پیار کرتی ہوں', dir: 'rtl' },

  // Asie du Sud
  { lang: 'hi', label: 'Hindi', text: 'मैं तुमसे प्यार करती हूँ' },
  { lang: 'mr', label: 'Marathi', text: 'मी तुझ्यावर प्रेम करते' },
  { lang: 'ne', label: 'Népalais', text: 'म तिमीलाई माया गर्छु' },
  { lang: 'bn', label: 'Bengali', text: 'আমি তোমাকে ভালোবাসি' },
  { lang: 'ta', label: 'Tamoul', text: 'நான் உன்னை காதலிக்கிறேன்' },

  // Asie de l'Est et du Sud-Est, Pacifique
  { lang: 'zh', label: 'Chinois (simplifié)', text: '我爱你' },
  { lang: 'zh-Hant', label: 'Chinois (traditionnel)', text: '我愛你' },
  { lang: 'ja', label: 'Japonais', text: '愛してる' },
  { lang: 'ko', label: 'Coréen', text: '사랑해' },
  { lang: 'th', label: 'Thaï', text: 'ฉันรักคุณ' },
  { lang: 'vi', label: 'Vietnamien', text: 'Em yêu anh' },
  { lang: 'tl', label: 'Tagalog', text: 'Mahal kita' },
  { lang: 'id', label: 'Indonésien', text: 'Aku cinta kamu' },
  { lang: 'ms', label: 'Malais', text: 'Saya cintakan awak' },
  { lang: 'haw', label: 'Hawaïen', text: 'Aloha au iā ʻoe' },
  { lang: 'mi', label: 'Maori', text: 'Kei te aroha au ki a koe' },
  { lang: 'ty', label: 'Tahitien', text: 'Ua here au ia oe' },
  { lang: 'sm', label: 'Samoan', text: 'Ou te alofa ia te oe' },

  // Afrique
  { lang: 'wo', label: 'Wolof', text: 'Damala beug' },
  { lang: 'wo', label: 'Wolof', text: 'Dama la nob' },
  { lang: 'ff', label: 'Peul (pulaar)', text: 'Mi yiɗi maa' }, // À VÉRIFIER
  { lang: 'bm', label: 'Bambara', text: "N b'i fɛ" }, // À VÉRIFIER
  { lang: 'ln', label: 'Lingala', text: 'Nalingi yo' },
  { lang: 'sw', label: 'Swahili', text: 'Nakupenda' },
  { lang: 'yo', label: 'Yoruba', text: 'Mo nífẹ̀ẹ́ rẹ' },
  { lang: 'ig', label: 'Igbo', text: "A hụrụ m gị n'anya" },
  { lang: 'ha', label: 'Haoussa', text: 'Ina son ka' },
  { lang: 'am', label: 'Amharique', text: 'እወድሃለሁ' },
  { lang: 'so', label: 'Somali', text: 'Waan ku jeclahay' },
  { lang: 'rw', label: 'Kinyarwanda', text: 'Ndagukunda' },
  { lang: 'zu', label: 'Zoulou', text: 'Ngiyakuthanda' },
  { lang: 'xh', label: 'Xhosa', text: 'Ndiyakuthanda' },
  { lang: 'af', label: 'Afrikaans', text: 'Ek het jou lief' },
  { lang: 'mg', label: 'Malgache', text: 'Tiako ianao' },

  // Créoles
  { lang: 'ht', label: 'Créole haïtien', text: 'Mwen renmen w' },
  { lang: 'gcf', label: 'Créole antillais', text: "Mwen enmé'w" }, // À VÉRIFIER
  { lang: 'mfe', label: 'Créole mauricien', text: 'Mo kontan twa' },
  { lang: 'rcf', label: 'Créole réunionnais', text: 'Mi aime aou' }, // À VÉRIFIER
]
