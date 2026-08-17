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

export const DEFAULT_SCENARIO: Scenario = SCENARIOS.spanish[0];

export function getDefaultScenarioForLanguageAndLevel(
  language: Language,
  level: ProficiencyLevel
): Scenario {
  const list = SCENARIOS[language.id] || SCENARIOS.spanish;
  const match = list.find((s) => s.difficultyLevel === level) || list[0];
  return match || DEFAULT_SCENARIO;
}
