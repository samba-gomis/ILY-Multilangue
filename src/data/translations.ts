export type Translation = {
  /** Code de langue (BCP 47). */
  lang: string
  /** Nom de la langue, en français. */
  label: string
  /** Pays (ou région) d'origine, affiché pendant le défilement. */
  country: string
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
  { lang: 'fr', label: 'Français', country: 'France', text: "Je t'aime" },
  { lang: 'en', label: 'Anglais', country: 'Royaume-Uni', text: 'I love you' },
  { lang: 'es', label: 'Espagnol', country: 'Espagne', text: 'Te amo' },
  { lang: 'pt', label: 'Portugais', country: 'Portugal', text: 'Eu te amo' },
  { lang: 'it', label: 'Italien', country: 'Italie', text: 'Ti amo' },
  { lang: 'de', label: 'Allemand', country: 'Allemagne', text: 'Ich liebe dich' },
  { lang: 'nl', label: 'Néerlandais', country: 'Pays-Bas', text: 'Ik hou van jou' },
  { lang: 'ca', label: 'Catalan', country: 'Catalogne', text: "T'estimo" },
  { lang: 'gl', label: 'Galicien', country: 'Galice', text: 'Quérote' },
  { lang: 'eu', label: 'Basque', country: 'Pays basque', text: 'Maite zaitut' },
  { lang: 'lb', label: 'Luxembourgeois', country: 'Luxembourg', text: 'Ech hunn dech gär' },
  { lang: 'ga', label: 'Irlandais', country: 'Irlande', text: 'Tá grá agam duit' },
  { lang: 'gd', label: 'Gaélique écossais', country: 'Écosse', text: 'Tha gaol agam ort' },
  { lang: 'cy', label: 'Gallois', country: 'Pays de Galles', text: "Rwy'n dy garu di" },
  { lang: 'mt', label: 'Maltais', country: 'Malte', text: 'Inħobbok' },
  { lang: 'eo', label: 'Espéranto', country: 'Langue internationale', text: 'Mi amas vin' },

  // Europe du Nord
  { lang: 'sv', label: 'Suédois', country: 'Suède', text: 'Jag älskar dig' },
  { lang: 'no', label: 'Norvégien', country: 'Norvège', text: 'Jeg elsker deg' },
  { lang: 'da', label: 'Danois', country: 'Danemark', text: 'Jeg elsker dig' },
  { lang: 'is', label: 'Islandais', country: 'Islande', text: 'Ég elska þig' },
  { lang: 'fi', label: 'Finnois', country: 'Finlande', text: 'Rakastan sinua' },
  { lang: 'et', label: 'Estonien', country: 'Estonie', text: 'Ma armastan sind' },
  { lang: 'lv', label: 'Letton', country: 'Lettonie', text: 'Es tevi mīlu' },
  { lang: 'lt', label: 'Lituanien', country: 'Lituanie', text: 'Aš tave myliu' },

  // Europe centrale et de l'Est
  { lang: 'pl', label: 'Polonais', country: 'Pologne', text: 'Kocham cię' },
  { lang: 'cs', label: 'Tchèque', country: 'Tchéquie', text: 'Miluji tě' },
  { lang: 'sk', label: 'Slovaque', country: 'Slovaquie', text: 'Ľúbim ťa' },
  { lang: 'hu', label: 'Hongrois', country: 'Hongrie', text: 'Szeretlek' },
  { lang: 'ro', label: 'Roumain', country: 'Roumanie', text: 'Te iubesc' },
  { lang: 'hr', label: 'Croate', country: 'Croatie', text: 'Volim te' },
  { lang: 'sl', label: 'Slovène', country: 'Slovénie', text: 'Ljubim te' },
  { lang: 'sq', label: 'Albanais', country: 'Albanie', text: 'Të dua' },
  { lang: 'el', label: 'Grec', country: 'Grèce', text: "Σ'αγαπώ" },
  { lang: 'ru', label: 'Russe', country: 'Russie', text: 'Я тебя люблю' },
  { lang: 'uk', label: 'Ukrainien', country: 'Ukraine', text: 'Я тебе кохаю' },
  { lang: 'be', label: 'Biélorusse', country: 'Biélorussie', text: 'Я цябе кахаю' },
  { lang: 'bg', label: 'Bulgare', country: 'Bulgarie', text: 'Обичам те' },
  { lang: 'sr', label: 'Serbe', country: 'Serbie', text: 'Волим те' },
  { lang: 'mk', label: 'Macédonien', country: 'Macédoine du Nord', text: 'Те сакам' },

  // Caucase, Asie centrale, Moyen-Orient
  { lang: 'hy', label: 'Arménien', country: 'Arménie', text: 'Սիրում եմ քեզ' },
  { lang: 'ka', label: 'Géorgien', country: 'Géorgie', text: 'მიყვარხარ' },
  { lang: 'tr', label: 'Turc', country: 'Turquie', text: 'Seni seviyorum' },
  { lang: 'az', label: 'Azerbaïdjanais', country: 'Azerbaïdjan', text: 'Səni sevirəm' },
  { lang: 'uz', label: 'Ouzbek', country: 'Ouzbékistan', text: 'Seni sevaman' },
  { lang: 'kk', label: 'Kazakh', country: 'Kazakhstan', text: 'Мен сені сүйемін' },
  { lang: 'mn', label: 'Mongol', country: 'Mongolie', text: 'Би чамд хайртай' },
  { lang: 'ku', label: 'Kurde (kurmandji)', country: 'Kurdistan', text: 'Ez ji te hez dikim' },
  { lang: 'ar', label: 'Arabe', country: 'Égypte', text: 'أحبك', dir: 'rtl' },
  { lang: 'ar', label: 'Arabe marocain (darija)', country: 'Maroc', text: 'كنبغيك', dir: 'rtl' },
  { lang: 'he', label: 'Hébreu', country: 'Israël', text: 'אני אוהבת אותך', dir: 'rtl' },
  { lang: 'fa', label: 'Persan', country: 'Iran', text: 'دوستت دارم', dir: 'rtl' },
  { lang: 'ur', label: 'Ourdou', country: 'Pakistan', text: 'میں تم سے پیار کرتی ہوں', dir: 'rtl' },

  // Asie du Sud
  { lang: 'hi', label: 'Hindi', country: 'Inde', text: 'मैं तुमसे प्यार करती हूँ' },
  { lang: 'mr', label: 'Marathi', country: 'Inde', text: 'मी तुझ्यावर प्रेम करते' },
  { lang: 'ne', label: 'Népalais', country: 'Népal', text: 'म तिमीलाई माया गर्छु' },
  { lang: 'bn', label: 'Bengali', country: 'Bangladesh', text: 'আমি তোমাকে ভালোবাসি' },
  { lang: 'ta', label: 'Tamoul', country: 'Inde', text: 'நான் உன்னை காதலிக்கிறேன்' },

  // Asie de l'Est et du Sud-Est, Pacifique
  { lang: 'zh', label: 'Chinois (simplifié)', country: 'Chine', text: '我爱你' },
  { lang: 'zh-Hant', label: 'Chinois (traditionnel)', country: 'Taïwan', text: '我愛你' },
  { lang: 'ja', label: 'Japonais', country: 'Japon', text: '愛してる' },
  { lang: 'ko', label: 'Coréen', country: 'Corée du Sud', text: '사랑해' },
  { lang: 'th', label: 'Thaï', country: 'Thaïlande', text: 'ฉันรักคุณ' },
  { lang: 'vi', label: 'Vietnamien', country: 'Viêt Nam', text: 'Em yêu anh' },
  { lang: 'tl', label: 'Tagalog', country: 'Philippines', text: 'Mahal kita' },
  { lang: 'id', label: 'Indonésien', country: 'Indonésie', text: 'Aku cinta kamu' },
  { lang: 'ms', label: 'Malais', country: 'Malaisie', text: 'Saya cintakan awak' },
  { lang: 'haw', label: 'Hawaïen', country: 'Hawaï', text: 'Aloha au iā ʻoe' },
  { lang: 'mi', label: 'Maori', country: 'Nouvelle-Zélande', text: 'Kei te aroha au ki a koe' },
  { lang: 'ty', label: 'Tahitien', country: 'Polynésie française', text: 'Ua here au ia oe' },
  { lang: 'sm', label: 'Samoan', country: 'Samoa', text: 'Ou te alofa ia te oe' },

  // Afrique
  { lang: 'wo', label: 'Wolof', country: 'Sénégal', text: 'Damala beug' },
  { lang: 'wo', label: 'Wolof', country: 'Sénégal', text: 'Dama la nob' },
  { lang: 'ff', label: 'Peul (pulaar)', country: 'Sénégal', text: 'Mi yiɗi maa' }, // À VÉRIFIER
  { lang: 'bm', label: 'Bambara', country: 'Mali', text: "N b'i fɛ" }, // À VÉRIFIER
  { lang: 'ln', label: 'Lingala', country: 'RD Congo', text: 'Nalingi yo' },
  { lang: 'sw', label: 'Swahili', country: 'Tanzanie', text: 'Nakupenda' },
  { lang: 'yo', label: 'Yoruba', country: 'Nigeria', text: 'Mo nífẹ̀ẹ́ rẹ' },
  { lang: 'ig', label: 'Igbo', country: 'Nigeria', text: "A hụrụ m gị n'anya" },
  { lang: 'ha', label: 'Haoussa', country: 'Nigeria', text: 'Ina son ka' },
  { lang: 'am', label: 'Amharique', country: 'Éthiopie', text: 'እወድሃለሁ' },
  { lang: 'so', label: 'Somali', country: 'Somalie', text: 'Waan ku jeclahay' },
  { lang: 'rw', label: 'Kinyarwanda', country: 'Rwanda', text: 'Ndagukunda' },
  { lang: 'zu', label: 'Zoulou', country: 'Afrique du Sud', text: 'Ngiyakuthanda' },
  { lang: 'xh', label: 'Xhosa', country: 'Afrique du Sud', text: 'Ndiyakuthanda' },
  { lang: 'af', label: 'Afrikaans', country: 'Afrique du Sud', text: 'Ek het jou lief' },
  { lang: 'mg', label: 'Malgache', country: 'Madagascar', text: 'Tiako ianao' },

  // Créoles
  { lang: 'ht', label: 'Créole haïtien', country: 'Haïti', text: 'Mwen renmen w' },
  { lang: 'gcf', label: 'Créole antillais', country: 'Guadeloupe et Martinique', text: "Mwen enmé'w" }, // À VÉRIFIER
  { lang: 'mfe', label: 'Créole mauricien', country: 'Maurice', text: 'Mo kontan twa' },
  { lang: 'rcf', label: 'Créole réunionnais', country: 'La Réunion', text: 'Mi aime aou' }, // À VÉRIFIER
]
