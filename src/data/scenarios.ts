import { Language, ProficiencyLevel, Scenario } from '../types';

export const SCENARIOS: Record<string, Scenario[]> = {
  spanish: [
    {
      id: 'es-cafe-starter',
      title: 'Ordering Morning Coffee & Pastry',
      category: 'Dining',
      role: 'Customer entering a cozy Madrid café',
      partnerRole: 'Friendly Barista',
      setting: 'A warm neighborhood café in Madrid with the aroma of freshly ground espresso',
      difficultyLevel: 'A1',
      objectives: [
        'Greet the barista naturally',
        'Order coffee with your preferred milk',
        'Ask how much it costs and say thank you',
      ],
      initialMessage: '¡Hola! Buenos días, ¿qué te pongo hoy?',
      initialMessageTranslation: 'Hello! Good morning, what can I get started for you today?',
      initialMessageRomanization: '¡Hola! Buenos días, ¿qué te pongo hoy?',
      icon: 'Coffee',
      suggestedReplies: [
        { text: 'Un café con leche y un cruasán, por favor.', translation: 'A coffee with milk and a croissant, please.' },
        { text: '¿Cuánto cuesta un café solo?', translation: 'How much is an espresso?' },
        { text: 'Buenos días. Para llevar, por favor.', translation: 'Good morning. To go, please.' },
      ],
    },
    {
      id: 'es-tapas-b1',
      title: 'Tapas Bar & Dietary Questions',
      category: 'Dining',
      role: 'Diner exploring local specialties',
      partnerRole: 'Lively Tapas Waiter',
      setting: 'A bustling tapas bar in Seville at 9 PM',
      difficultyLevel: 'B1',
      objectives: [
        'Ask about house specialties and ingredients',
        'Specify any food preferences or allergies',
        'Request the bill when finished',
      ],
      initialMessage: '¡Buenas noches! Bienvenidos. ¿Tienen mesa reservada o prefieren la barra?',
      initialMessageTranslation: 'Good evening! Welcome. Do you have a table reserved or prefer the bar?',
      initialMessageRomanization: '¡Buenas noches! Bienvenidos...',
      icon: 'Utensils',
      suggestedReplies: [
        { text: 'Preferimos una mesa cerca de la ventana, si es posible.', translation: 'We prefer a table near the window if possible.' },
        { text: '¿Qué nos recomienda de la casa?', translation: 'What do you recommend from the house specialties?' },
        { text: '¿Tienen opciones vegetarianas?', translation: 'Do you have vegetarian options?' },
      ],
    },
    {
      id: 'es-hotel-checkin',
      title: 'Hotel Check-in & Requesting Extra Key',
      category: 'Travel',
      role: 'Hotel guest arriving from a long flight',
      partnerRole: 'Helpful Receptionist',
      setting: 'A boutique hotel lobby in Barcelona',
      difficultyLevel: 'A2',
      objectives: [
        'State your reservation name',
        'Ask what time breakfast is served',
        'Request the Wi-Fi password and an extra key',
      ],
      initialMessage: 'Buenas tardes, bienvenido al Hotel Gaudí. ¿Tiene una reserva con nosotros?',
      initialMessageTranslation: 'Good afternoon, welcome to Hotel Gaudí. Do you have a reservation with us?',
      initialMessageRomanization: 'Buenas tardes, bienvenido al Hotel Gaudí...',
      icon: 'Compass',
      suggestedReplies: [
        { text: 'Sí, tengo una reserva a nombre de Mohamed.', translation: 'Yes, I have a reservation under the name Mohamed.' },
        { text: '¿A qué hora se sirve el desayuno?', translation: 'What time is breakfast served?' },
        { text: '¿Me podría dar la clave del Wi-Fi?', translation: 'Could you give me the Wi-Fi password?' },
      ],
    },
    {
      id: 'es-job-interview-b2',
      title: 'Job Interview for Tech Role',
      category: 'Career',
      role: 'Software developer candidate',
      partnerRole: 'Lead Hiring Manager',
      setting: 'A professional interview meeting room in Valencia',
      difficultyLevel: 'B2',
      objectives: [
        'Introduce your professional background smoothly',
        'Describe how you solved a challenging team problem',
        'Ask about team culture and growth opportunities',
      ],
      initialMessage: 'Mucho gusto. Gracias por venir hoy. Para empezar, ¿podrías contarnos un poco sobre tu trayectoria profesional?',
      initialMessageTranslation: 'Pleased to meet you. Thanks for coming today. To start, could you tell us a bit about your professional background?',
      initialMessageRomanization: 'Mucho gusto. Gracias por venir hoy...',
      icon: 'Briefcase',
      suggestedReplies: [
        { text: 'Con mucho gusto. He trabajado los últimos tres años como desarrollador frontend.', translation: 'With pleasure. I have worked the past three years as a frontend developer.' },
        { text: 'Me apasiona resolver problemas complejos en equipo.', translation: 'I am passionate about solving complex problems in teams.' },
      ],
    },
  ],
  french: [
    {
      id: 'fr-bakery-starter',
      title: 'Buying Fresh Baguette & Pastries',
      category: 'Dining',
      role: 'Customer in a Parisian boulangerie',
      partnerRole: 'Charming Baker',
      setting: 'A traditional bakery in Montmartre early in the morning',
      difficultyLevel: 'A1',
      objectives: [
        'Greet with polite French etiquette (Bonjour madame/monsieur)',
        'Order one traditional baguette and a pain au chocolat',
        'Pay with contactless card and say goodbye',
      ],
      initialMessage: 'Bonjour ! Qu\'est-ce qui vous ferait plaisir aujourd\'hui ?',
      initialMessageTranslation: 'Hello! What would you like today?',
      initialMessageRomanization: 'Bonjour ! Qu\'est-ce qui vous ferait plaisir...',
      icon: 'Coffee',
      suggestedReplies: [
        { text: 'Une baguette tradition et deux croissants, s\'il vous plaît.', translation: 'One traditional baguette and two croissants, please.' },
        { text: 'Est-ce que je peux payer par carte ?', translation: 'Can I pay by card?' },
        { text: 'Merci beaucoup, bonne journée !', translation: 'Thank you very much, have a nice day!' },
      ],
    },
    {
      id: 'fr-train-station',
      title: 'Buying High-Speed Train Tickets at Gare de Lyon',
      category: 'Travel',
      role: 'Traveler planning a trip to Nice',
      partnerRole: 'SNCF Ticket Agent',
      setting: 'Gare de Lyon ticket counter in Paris',
      difficultyLevel: 'A2',
      objectives: [
        'Request a round-trip ticket for this weekend',
        'Ask about seat options (window vs aisle, first vs second class)',
        'Check departure platform and boarding time',
      ],
      initialMessage: 'Bonjour monsieur. Comment puis-je vous aider pour votre voyage ?',
      initialMessageTranslation: 'Hello sir. How can I help you with your journey?',
      initialMessageRomanization: 'Bonjour monsieur...',
      icon: 'Compass',
      suggestedReplies: [
        { text: 'Je voudrais un billet aller-retour pour Nice, s\'il vous plaît.', translation: 'I would like a round-trip ticket to Nice, please.' },
        { text: 'Préférablement côté fenêtre en deuxième classe.', translation: 'Preferably window side in second class.' },
      ],
    },
  ],
  german: [
    {
      id: 'de-cafe-starter',
      title: 'Ordering at a Berlin Coffee Shop',
      category: 'Dining',
      role: 'Customer ordering morning drinks and pretzels',
      partnerRole: 'Barista in Mitte',
      setting: 'A modern, hip café in Berlin-Mitte',
      difficultyLevel: 'A1',
      objectives: [
        'Greet in German',
        'Order coffee with oat milk and a fresh pretzel',
        'Ask for the total cost and pay',
      ],
      initialMessage: 'Hallo! Was darf es denn für dich sein?',
      initialMessageTranslation: 'Hello! What can I get for you?',
      initialMessageRomanization: 'Hallo! Was darf es denn für dich sein?',
      icon: 'Coffee',
      suggestedReplies: [
        { text: 'Einen Cappuccino mit Hafermilch, bitte.', translation: 'A cappuccino with oat milk, please.' },
        { text: 'Haben Sie frische Brezeln?', translation: 'Do you have fresh pretzels?' },
        { text: 'Was kostet das zusammen?', translation: 'How much is that together?' },
      ],
    },
  ],
  italian: [
    {
      id: 'it-gelateria-starter',
      title: 'Ordering Artisanal Gelato in Florence',
      category: 'Dining',
      role: 'Customer choosing gelato flavors',
      partnerRole: 'Gelataio in Piazza del Duomo',
      setting: 'A famous gelateria in central Florence',
      difficultyLevel: 'A1',
      objectives: [
        'Choose cup (coppetta) or cone (cono)',
        'Select two distinct flavors (pistacchio e stracciatella)',
        'Ask for whipped cream on top (con panna)',
      ],
      initialMessage: 'Ciao! Benvenuto! Cono o coppetta oggi?',
      initialMessageTranslation: 'Hello! Welcome! Cone or cup today?',
      initialMessageRomanization: 'Ciao! Benvenuto! Cono o coppetta oggi?',
      icon: 'Utensils',
      suggestedReplies: [
        { text: 'Una coppetta media con pistacchio e cioccolato, per favore.', translation: 'A medium cup with pistachio and chocolate, please.' },
        { text: 'Con panna montata sopra, grazie!', translation: 'With whipped cream on top, thank you!' },
      ],
    },
  ],
  japanese: [
    {
      id: 'ja-izakaya-starter',
      title: 'Ordering Food at a Tokyo Izakaya',
      category: 'Dining',
      role: 'Customer entering an authentic Japanese tavern',
      partnerRole: 'Enthusiastic Izakaya Server',
      setting: 'A lively izakaya in Shinjuku, Tokyo',
      difficultyLevel: 'A1',
      objectives: [
        'Request a table for one or two people',
        'Order green tea / water and yakitori skewers',
        'Ask for the bill (Okaikei onegaishimasu)',
      ],
      initialMessage: 'いらっしゃいませ！何名様でしょうか？',
      initialMessageTranslation: 'Welcome! How many people in your party?',
      initialMessageRomanization: 'Irasshaimase! Nan-mei-sama deshō ka?',
      icon: 'Utensils',
      suggestedReplies: [
        { text: '一人です。カウンター席は空いていますか？', translation: 'One person. Is the counter seat available?' },
        { text: 'おすすめの焼き鳥は何ですか？', translation: 'What yakitori do you recommend?' },
        { text: 'お会計をお願いします。', translation: 'Check please / The bill, please.' },
      ],
    },
  ],
};


type PracticeCategory = 'Daily Life' | 'Dining' | 'Travel' | 'Career' | 'Shopping';

const PRACTICE_META: Record<PracticeCategory, {
  title: string;
  role: string;
  partnerRole: string;
  setting: string;
  objectives: string[];
  icon: string;
}> = {
  'Daily Life': {
    title: 'Introduce Yourself & First Conversation',
    role: 'Learner meeting someone for the first time',
    partnerRole: 'Friendly Local',
    setting: 'A relaxed first meeting in an everyday social setting',
    objectives: ['Greet naturally', 'Say your name and where you are from', 'Ask one simple question'],
    icon: 'Sparkles',
  },
  Dining: {
    title: 'Order Food & Drink',
    role: 'Customer ordering a simple meal or drink',
    partnerRole: 'Restaurant Server',
    setting: 'A casual local restaurant or cafÃ©',
    objectives: ['Greet the server', 'Order food or a drink politely', 'Ask the price and say thank you'],
    icon: 'Utensils',
  },
  Travel: {
    title: 'Hotel Check-in & Directions',
    role: 'Traveler needing practical help',
    partnerRole: 'Hotel Receptionist',
    setting: 'A hotel reception desk near the city center',
    objectives: ['Check in', 'Ask about a hotel service', 'Ask for simple directions'],
    icon: 'Compass',
  },
  Career: {
    title: 'Career & Job Interview',
    role: 'Candidate in a beginner-friendly interview',
    partnerRole: 'Hiring Manager',
    setting: 'A friendly professional interview',
    objectives: ['Introduce yourself', 'Describe one skill or experience', 'Ask one question about the job'],
    icon: 'Briefcase',
  },
  Shopping: {
    title: 'Shopping & Market',
    role: 'Customer shopping for an everyday item',
    partnerRole: 'Shop Assistant',
    setting: 'A local shop or market',
    objectives: ['Ask for an item', 'Ask the price or size', 'Pay and close the interaction politely'],
    icon: 'ShoppingBag',
  },
};

const LANGUAGE_STARTERS: Record<string, { greeting: string; replies: Array<{ text: string; translation: string }> }> = {
  english: { greeting: 'Hello! Welcome. How can I help you today?', replies: [
    { text: 'Hello! I would like some help, please.', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£ÙˆØ¯ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'Could you tell me more?', translation: 'Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ùƒ Ø£Ù† ØªØ®Ø¨Ø±Ù†ÙŠ Ø¨Ø§Ù„Ù…Ø²ÙŠØ¯ØŸ' },
    { text: 'Thank you. I am ready.', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
  spanish: { greeting: 'Â¡Hola! Bienvenido. Â¿En quÃ© puedo ayudarte hoy?', replies: [
    { text: 'Hola, necesito un poco de ayuda, por favor.', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'Â¿Puede explicÃ¡rmelo, por favor?', translation: 'Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ùƒ Ø´Ø±Ø­ Ø°Ù„Ùƒ Ù…Ù† ÙØ¶Ù„ÙƒØŸ' },
    { text: 'Gracias. Estoy listo.', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
  french: { greeting: 'Bonjour ! Bienvenue. Comment puis-je vous aider aujourdâ€™hui ?', replies: [
    { text: 'Bonjour, jâ€™aimerais un peu dâ€™aide, sâ€™il vous plaÃ®t.', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£ÙˆØ¯ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'Pouvez-vous mâ€™expliquer, sâ€™il vous plaÃ®t ?', translation: 'Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ùƒ Ø´Ø±Ø­ Ø°Ù„Ùƒ Ù…Ù† ÙØ¶Ù„ÙƒØŸ' },
    { text: 'Merci. Je suis prÃªt.', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
  german: { greeting: 'Hallo! Willkommen. Wie kann ich dir heute helfen?', replies: [
    { text: 'Hallo, ich brauche bitte etwas Hilfe.', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'KÃ¶nnen Sie das bitte erklÃ¤ren?', translation: 'Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ùƒ Ø´Ø±Ø­ Ø°Ù„Ùƒ Ù…Ù† ÙØ¶Ù„ÙƒØŸ' },
    { text: 'Danke. Ich bin bereit.', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
  italian: { greeting: 'Ciao! Benvenuto. Come posso aiutarti oggi?', replies: [
    { text: 'Ciao, avrei bisogno di un poâ€™ di aiuto, per favore.', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'PuÃ² spiegarmelo, per favore?', translation: 'Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ùƒ Ø´Ø±Ø­ Ø°Ù„Ùƒ Ù…Ù† ÙØ¶Ù„ÙƒØŸ' },
    { text: 'Grazie. Sono pronto.', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
  portuguese: { greeting: 'OlÃ¡! Bem-vindo. Como posso ajudar vocÃª hoje?', replies: [
    { text: 'OlÃ¡, preciso de uma ajuda, por favor.', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'Pode explicar, por favor?', translation: 'Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ùƒ Ø´Ø±Ø­ Ø°Ù„Ùƒ Ù…Ù† ÙØ¶Ù„ÙƒØŸ' },
    { text: 'Obrigado. Estou pronto.', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
  russian: { greeting: 'Ð—Ð´Ñ€Ð°Ð²ÑÑ‚Ð²ÑƒÐ¹Ñ‚Ðµ! Ð”Ð¾Ð±Ñ€Ð¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°Ñ‚ÑŒ. Ð§ÐµÐ¼ Ñ Ð¼Ð¾Ð³Ñƒ Ð²Ð°Ð¼ Ð¿Ð¾Ð¼Ð¾Ñ‡ÑŒ?', replies: [
    { text: 'Ð—Ð´Ñ€Ð°Ð²ÑÑ‚Ð²ÑƒÐ¹Ñ‚Ðµ, Ð¼Ð½Ðµ Ð½ÑƒÐ¶Ð½Ð° Ð¿Ð¾Ð¼Ð¾Ñ‰ÑŒ, Ð¿Ð¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°.', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'ÐœÐ¾Ð¶ÐµÑ‚Ðµ Ð¾Ð±ÑŠÑÑÐ½Ð¸Ñ‚ÑŒ, Ð¿Ð¾Ð¶Ð°Ð»ÑƒÐ¹ÑÑ‚Ð°?', translation: 'Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ùƒ Ø´Ø±Ø­ Ø°Ù„Ùƒ Ù…Ù† ÙØ¶Ù„ÙƒØŸ' },
    { text: 'Ð¡Ð¿Ð°ÑÐ¸Ð±Ð¾. Ð¯ Ð³Ð¾Ñ‚Ð¾Ð².', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
  japanese: { greeting: 'ã“ã‚“ã«ã¡ã¯ï¼ã„ã‚‰ã£ã—ã‚ƒã„ã¾ã›ã€‚ä»Šæ—¥ã¯ã©ã†ã•ã‚Œã¾ã—ãŸã‹ï¼Ÿ', replies: [
    { text: 'ã“ã‚“ã«ã¡ã¯ã€‚ã¡ã‚‡ã£ã¨åŠ©ã‘ã¦ãã ã•ã„ã€‚', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'ã‚‚ã†ä¸€åº¦èª¬æ˜Žã—ã¦ãã ã•ã„ã€‚', translation: 'Ù…Ù† ÙØ¶Ù„Ùƒ Ø§Ø´Ø±Ø­ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.' },
    { text: 'ã‚ã‚ŠãŒã¨ã†ã”ã–ã„ã¾ã™ã€‚æº–å‚™ã§ãã¾ã—ãŸã€‚', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
  korean: { greeting: 'ì•ˆë…•í•˜ì„¸ìš”! ì–´ì„œ ì˜¤ì„¸ìš”. ì˜¤ëŠ˜ ë¬´ì—‡ì„ ë„ì™€ë“œë¦´ê¹Œìš”?', replies: [
    { text: 'ì•ˆë…•í•˜ì„¸ìš”. ì¢€ ë„ì™€ì£¼ì„¸ìš”.', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'ë‹¤ì‹œ ì„¤ëª…í•´ ì£¼ì„¸ìš”.', translation: 'Ù…Ù† ÙØ¶Ù„Ùƒ Ø§Ø´Ø±Ø­ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.' },
    { text: 'ê°ì‚¬í•©ë‹ˆë‹¤. ì¤€ë¹„ëì–´ìš”.', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
  arabic: { greeting: 'Ù…Ø±Ø­Ø¨Ø§Ù‹! Ø£Ù‡Ù„Ø§Ù‹ Ø¨Ùƒ. ÙƒÙŠÙ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ Ø§Ù„ÙŠÙˆÙ…ØŸ', replies: [
    { text: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.', translation: 'Hello, I need some help please.' },
    { text: 'Ù‡Ù„ ÙŠÙ…ÙƒÙ†Ùƒ Ø£Ù† ØªØ´Ø±Ø­ Ø°Ù„Ùƒ Ù…Ù† ÙØ¶Ù„ÙƒØŸ', translation: 'Could you explain that, please?' },
    { text: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.', translation: 'Thank you, I am ready.' },
  ]},
  chinese: { greeting: 'ä½ å¥½ï¼æ¬¢è¿Žã€‚ä»Šå¤©æˆ‘å¯ä»¥æ€Žä¹ˆå¸®ä½ ï¼Ÿ', replies: [
    { text: 'ä½ å¥½ï¼Œè¯·å¸®å¸®æˆ‘ã€‚', translation: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø­ØªØ§Ø¬ Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ù† ÙØ¶Ù„Ùƒ.' },
    { text: 'è¯·å†è§£é‡Šä¸€ä¸‹ã€‚', translation: 'Ù…Ù† ÙØ¶Ù„Ùƒ Ø§Ø´Ø±Ø­ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.' },
    { text: 'è°¢è°¢ï¼Œæˆ‘å‡†å¤‡å¥½äº†ã€‚', translation: 'Ø´ÙƒØ±Ø§Ù‹ØŒ Ø£Ù†Ø§ Ù…Ø³ØªØ¹Ø¯.' },
  ]},
};

export function buildPracticeScenario(language: Language, level: ProficiencyLevel, category: string, templateId = 'practice'): Scenario {
  const normalizedCategory = (Object.keys(PRACTICE_META) as PracticeCategory[])
    .find((key) => key.toLowerCase() === category.toLowerCase()) || 'Daily Life';

  const authored = (SCENARIOS[language.id] || []).find(
    (s) => s.category.toLowerCase() === normalizedCategory.toLowerCase()
  );
  if (authored) return authored;

  const meta = PRACTICE_META[normalizedCategory];
  const starter = LANGUAGE_STARTERS[language.id] || LANGUAGE_STARTERS.english;

  return {
    id: `${language.id}-${templateId}-${normalizedCategory.toLowerCase().replace(/\s+/g, '-')}`,
    title: meta.title,
    category: normalizedCategory,
    role: meta.role,
    partnerRole: meta.partnerRole,
    setting: `${meta.setting}. Conduct the interaction naturally in ${language.name}.`,
    difficultyLevel: level,
    objectives: meta.objectives,
    initialMessage: starter.greeting,
    initialMessageTranslation: starter.greeting,
    initialMessageRomanization: '',
    icon: meta.icon,
    suggestedReplies: starter.replies,
  };
}

export const DEFAULT_SCENARIO: Scenario = SCENARIOS.spanish[0];

export function getDefaultScenarioForLanguageAndLevel(
  language: Language,
  level: ProficiencyLevel
): Scenario {
  const list = SCENARIOS[language.id] || [];
  const match = list.find((s) => s.difficultyLevel === level) || list[0];
  return match || buildPracticeScenario(language, level, 'Daily Life', 'default');
}
